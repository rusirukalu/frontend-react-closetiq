import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { Card, CardContent } from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Grid,
  List,
  Heart,
  Edit3,
  Trash2,
  Plus,
  Shirt,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchWardrobes,
  setCurrentWardrobe,
  createWardrobe,
} from "@/store/slices/wardrobeSlice";
import {
  fetchClothingItems,
  createClothingItem,
  toggleFavorite,
  clearError,
} from "@/store/slices/clothingSlice";

// ✅ UPDATED: Clothing item type to match backend structure
interface ClothingItem {
  _id: string;
  userId: string;
  wardrobeId: string;
  name: string;
  category: string;
  brand?: string;
  color: string;
  size?: string;
  price?: number;
  purchaseDate?: string;
  imageUrl?: string;

  attributes?: {
    colors?: string[];
    patterns?: string[];
    materials?: string[];
  };

  userMetadata?: {
    userTags?: string[];
    isFavorite?: boolean;
    timesWorn?: number;
    notes?: string;
    size?: string;
    price?: number;
    purchaseDate?: string | null;
  };

  aiClassification?: {
    confidence: number;
    modelVersion: string;
    allPredictions: Array<{
      category: string;
      confidence: number;
    }>;
    processingTime: number;
    qualityScore: number;
  };

  tags: string[];
  notes?: string;
  isFavorite: boolean;
  timesWorn: number;
  lastWorn?: string;
  createdAt: string;
  updatedAt: string;
  confidence?: number;
  aiClassified?: boolean;
  id?: string;
}

const WardrobePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    wardrobes,
    currentWardrobe,
    isLoading: wardrobesLoading,
    error: wardrobeError,
  } = useAppSelector((state) => state.wardrobe);
  const {
    items: clothingItems,
    isLoading: clothingLoading,
    error: clothingError,
  } = useAppSelector((state) => state.clothing);
  const user = useAppSelector((state) => state.auth.user);

  // Safe array checks
  const safeWardrobes = Array.isArray(wardrobes) ? wardrobes : [];
  const safeClothingItems = Array.isArray(clothingItems) ? clothingItems : [];

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isCreateWardrobeOpen, setCreateWardrobeOpen] = useState(false);
  const [newWardrobeName, setNewWardrobeName] = useState("");
  const [newItem, setNewItem] = useState<{
    name: string;
    category: string;
    brand: string;
    color: string;
    image: File | null;
    tags: string;
  }>({
    name: "",
    category: "",
    brand: "",
    color: "",
    image: null,
    tags: "",
  });

  // Categories
  const categories = [
    "all",
    "shirts_blouses",
    "tshirts_tops",
    "dresses",
    "pants_jeans",
    "shorts",
    "skirts",
    "jackets_coats",
    "sweaters",
    "shoes_sneakers",
    "shoes_formal",
    "bags_accessories",
  ];

  // Color options
  const colors = [
    "black",
    "white",
    "gray",
    "red",
    "blue",
    "green",
    "yellow",
    "orange",
    "purple",
    "pink",
    "brown",
    "navy",
    "beige",
    "maroon",
    "multicolor",
    "unknown",
  ];

  // ✅ ADDED: Deduplication function
  const deduplicateItems = (items: any[]): any[] => {
    const seen = new Set();
    return items.filter((item) => {
      const id = item._id || item.id;
      if (seen.has(id)) {
        return false;
      }
      seen.add(id);
      return true;
    });
  };

  // ✅ UPDATED: Apply deduplication to clothing items
  const deduplicatedItems = deduplicateItems(safeClothingItems);

  // Fetch wardrobes and items
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchWardrobes());
    }
  }, [dispatch, user?.id]);

  // ✅ UPDATED: Force refresh items when wardrobe changes and clear any errors
  useEffect(() => {
    if (currentWardrobe && user?.id) {
      dispatch(clearError()); // Clear any previous errors
      dispatch(fetchClothingItems({ wardrobeId: currentWardrobe._id }));
    }
  }, [dispatch, currentWardrobe, user?.id]);

  // ✅ ADDED: Refresh items when component mounts (handles navigation from ClassifyPage)
  useEffect(() => {
    if (currentWardrobe && user?.id) {
      // Small delay to ensure proper state initialization
      const timer = setTimeout(() => {
        dispatch(fetchClothingItems({ wardrobeId: currentWardrobe._id }));
      }, 100);

      return () => clearTimeout(timer);
    }
  }, []); // Run only on mount

  // ✅ UPDATED: Use deduplicated items for filtering
  const filteredItems = deduplicatedItems.filter((item: any) => {
    const name = item.name || "";
    const brand = item.brand || "";
    const category = item.category || "";

    let tags: string[] = [];
    if (
      item.userMetadata?.userTags &&
      Array.isArray(item.userMetadata.userTags)
    ) {
      tags = item.userMetadata.userTags;
    } else if (item.tags && Array.isArray(item.tags)) {
      tags = item.tags;
    }

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tags.some(
        (tag) =>
          tag &&
          typeof tag === "string" &&
          tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "all" || category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle wardrobe change
  const handleWardrobeChange = (wardrobeId: string) => {
    const wardrobe = safeWardrobes.find((w) => w._id === wardrobeId);
    if (wardrobe) {
      dispatch(setCurrentWardrobe(wardrobe));
    }
  };

  const handleCreateWardrobe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error("You must be logged in to create a wardrobe.");
      return;
    }

    if (!newWardrobeName.trim()) {
      toast.error("Wardrobe name is required.");
      return;
    }

    try {
      const result = await dispatch(
        createWardrobe({
          name: newWardrobeName.trim(),
          description: `${newWardrobeName.trim()} collection`,
        })
      ).unwrap();

      toast.success("Wardrobe created successfully!");
      setNewWardrobeName("");
      setCreateWardrobeOpen(false);
      dispatch(setCurrentWardrobe(result));
    } catch (error: any) {
      toast.error(error.message || "Failed to create wardrobe");
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error("You must be logged in to add items.");
      return;
    }

    if (!currentWardrobe) {
      toast.error("No wardrobe selected.");
      return;
    }

    if (
      !newItem.name ||
      !newItem.category ||
      !newItem.color ||
      !newItem.image
    ) {
      toast.error("Name, category, color, and image are required.");
      return;
    }

    const formData = new FormData();
    formData.append("wardrobeId", currentWardrobe._id);
    formData.append("name", newItem.name);
    formData.append("category", newItem.category);
    formData.append("brand", newItem.brand || "");
    formData.append("color", newItem.color);
    formData.append("image", newItem.image);
    formData.append("isFavorite", "false");
    formData.append("timesWorn", "0");

    if (newItem.tags) {
      const tagsArray = newItem.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      tagsArray.forEach((tag) => formData.append("tags[]", tag));
    }

    try {
      await dispatch(createClothingItem(formData)).unwrap();
      toast.success("Item added to wardrobe!");
      setNewItem({
        name: "",
        category: "",
        brand: "",
        color: "",
        image: null,
        tags: "",
      });
      setAddModalOpen(false);

      // ✅ ADDED: Refresh items after manual add to ensure consistency
      if (currentWardrobe) {
        dispatch(fetchClothingItems({ wardrobeId: currentWardrobe._id }));
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add item");
    }
  };

  const handleToggleFavorite = async (item: any) => {
    const itemId = item._id || item.id;
    const currentFavorite =
      item.userMetadata?.isFavorite ?? item.isFavorite ?? false;

    try {
      await dispatch(
        toggleFavorite({ id: itemId, isFavorite: !currentFavorite })
      ).unwrap();
      toast.success("Favorite status updated.");
    } catch (error: any) {
      toast.error(error.message || "Failed to update favorite status.");
    }
  };

  const handleEditItem = (itemId: string) => {
    console.log("Edit item:", itemId);
    toast("Edit item not implemented yet.");
  };

  const handleDeleteItem = (itemId: string) => {
    console.log("Delete item:", itemId);
    toast("Delete item not implemented yet.");
  };

  // ✅ UPDATED: Enhanced refresh function
  const handleRefreshWardrobes = () => {
    if (user?.id) {
      dispatch(fetchWardrobes());
      // Also refresh current wardrobe items
      if (currentWardrobe) {
        dispatch(fetchClothingItems({ wardrobeId: currentWardrobe._id }));
      }
      toast.success("Wardrobes refreshed!");
    }
  };

  const ItemCard: React.FC<{ item: any }> = ({ item }) => {
    const itemId = item._id || item.id;
    const name = item.name || "Untitled Item";
    const brand = item.brand || "No brand";
    const color = item.color || "Unknown color";
    const isFavorite =
      item.userMetadata?.isFavorite ?? item.isFavorite ?? false;
    const tags = item.userMetadata?.userTags || item.tags || [];
    const imageUrl = item.imageUrl || "/images/fallback-item.jpg";

    return (
      <Card className="group hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="relative mb-4">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-48 object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.src = "/images/fallback-item.jpg";
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              className={`absolute top-2 right-2 ${
                isFavorite ? "text-red-500" : "text-gray-400 dark:text-gray-500"
              } hover:bg-white/80 dark:hover:bg-gray-900/80`}
              onClick={() => handleToggleFavorite(item)}
            >
              <Heart
                className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`}
              />
            </Button>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold truncate text-gray-900 dark:text-gray-100">
              {name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {brand} • {color}
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 3).map((tag, index) => (
                <Badge
                  key={`${tag}-${index}`}
                  variant="secondary"
                  className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditItem(itemId)}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteItem(itemId)}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              My Wardrobe
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and organize your fashion collection
            </p>
            {/* ✅ ADDED: Debug info in development */}
            {process.env.NODE_ENV === "development" && (
              <p className="text-xs text-gray-500 mt-1">
                Total items: {deduplicatedItems.length} | Filtered:{" "}
                {filteredItems.length}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {safeWardrobes.length === 0 ? (
              <Dialog
                open={isCreateWardrobeOpen}
                onOpenChange={setCreateWardrobeOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-600">
                    <Shirt className="mr-2 h-4 w-4" />
                    Create Your First Wardrobe
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-gray-100">
                      Create New Wardrobe
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateWardrobe} className="space-y-4">
                    <div>
                      <Label
                        htmlFor="wardrobeName"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        Wardrobe Name
                      </Label>
                      <Input
                        id="wardrobeName"
                        value={newWardrobeName}
                        onChange={(e) => setNewWardrobeName(e.target.value)}
                        placeholder="e.g., Summer Collection, Work Clothes, Casual Wear"
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCreateWardrobeOpen(false)}
                        className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={wardrobesLoading}
                        className="bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-600"
                      >
                        {wardrobesLoading ? "Creating..." : "Create Wardrobe"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshWardrobes}
                  disabled={wardrobesLoading}
                  className="border-gray-300 dark:border-gray-600"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      wardrobesLoading ? "animate-spin" : ""
                    }`}
                  />
                </Button>
                <Select
                  value={currentWardrobe?._id || ""}
                  onValueChange={handleWardrobeChange}
                >
                  <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                    <SelectValue placeholder="Select wardrobe" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 z-50">
                    {safeWardrobes.map((wardrobe) => (
                      <SelectItem key={wardrobe._id} value={wardrobe._id}>
                        {wardrobe.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Dialog
                  open={isCreateWardrobeOpen}
                  onOpenChange={setCreateWardrobeOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Shirt className="mr-2 h-4 w-4" />
                      New Wardrobe
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                    <DialogHeader>
                      <DialogTitle className="text-gray-900 dark:text-gray-100">
                        Create New Wardrobe
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateWardrobe} className="space-y-4">
                      <div>
                        <Label
                          htmlFor="wardrobeName"
                          className="text-gray-700 dark:text-gray-300"
                        >
                          Wardrobe Name
                        </Label>
                        <Input
                          id="wardrobeName"
                          value={newWardrobeName}
                          onChange={(e) => setNewWardrobeName(e.target.value)}
                          placeholder="e.g., Summer Collection, Work Clothes, Casual Wear"
                          className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCreateWardrobeOpen(false)}
                          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={wardrobesLoading}
                          className="bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-600"
                        >
                          {wardrobesLoading ? "Creating..." : "Create Wardrobe"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </>
            )}

            {currentWardrobe && (
              <Dialog open={isAddModalOpen} onOpenChange={setAddModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-gray-100">
                      Add New Wardrobe Item
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddItem} className="space-y-4">
                    <div>
                      <Label
                        htmlFor="name"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        Name *
                      </Label>
                      <Input
                        id="name"
                        value={newItem.name}
                        onChange={(e) =>
                          setNewItem({ ...newItem, name: e.target.value })
                        }
                        placeholder="e.g., Blue Denim Jacket"
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="category"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        Category *
                      </Label>
                      <Select
                        value={newItem.category}
                        onValueChange={(value) =>
                          setNewItem({ ...newItem, category: value })
                        }
                      >
                        <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 z-50">
                          {categories
                            .filter((cat) => cat !== "all")
                            .map((category) => (
                              <SelectItem
                                key={category}
                                value={category}
                                className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                {category.replace("_", " ")}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label
                        htmlFor="color"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        Color *
                      </Label>
                      <Select
                        value={newItem.color}
                        onValueChange={(value) =>
                          setNewItem({ ...newItem, color: value })
                        }
                      >
                        <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                          <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 z-50">
                          {colors.map((color) => (
                            <SelectItem
                              key={color}
                              value={color}
                              className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              {color.charAt(0).toUpperCase() + color.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label
                        htmlFor="brand"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        Brand
                      </Label>
                      <Input
                        id="brand"
                        value={newItem.brand}
                        onChange={(e) =>
                          setNewItem({ ...newItem, brand: e.target.value })
                        }
                        placeholder="e.g., Levi's"
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="file"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        Image *
                      </Label>
                      <Input
                        id="file"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            image: e.target.files?.[0] || null,
                          })
                        }
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="tags"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        Tags (comma-separated)
                      </Label>
                      <Input
                        id="tags"
                        value={newItem.tags}
                        onChange={(e) =>
                          setNewItem({ ...newItem, tags: e.target.value })
                        }
                        placeholder="e.g., casual, denim"
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setAddModalOpen(false)}
                        className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={clothingLoading}
                        className="bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600"
                      >
                        {clothingLoading ? "Adding..." : "Add Item"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {safeWardrobes.length === 0 && !wardrobesLoading ? (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-8 text-center">
              <Shirt className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Wardrobes Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create your first wardrobe to start organizing your fashion
                collection!
              </p>
              <Button
                onClick={() => setCreateWardrobeOpen(true)}
                className="bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-600"
              >
                <Shirt className="mr-2 h-4 w-4" />
                Create Your First Wardrobe
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                <Input
                  placeholder="Search your wardrobe..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 z-50">
                  {categories.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {category === "all"
                        ? "All Categories"
                        : category.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none border-r border-gray-300 dark:border-gray-600"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {wardrobesLoading || clothingLoading ? (
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    Loading wardrobe items...
                  </p>
                </CardContent>
              </Card>
            ) : wardrobeError || clothingError ? (
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-8 text-center">
                  <p className="text-red-500 dark:text-red-400">
                    {wardrobeError || clothingError}
                  </p>
                </CardContent>
              </Card>
            ) : !currentWardrobe ? (
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    Please select a wardrobe to view items.
                  </p>
                </CardContent>
              </Card>
            ) : filteredItems.length === 0 ? (
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    No items found in this wardrobe.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }
              >
                {/* ✅ UPDATED: Use unique key with better fallback */}
                {filteredItems.map((item, index) => (
                  <ItemCard
                    key={`${item._id || item.id || index}-${
                      item.createdAt || Date.now()
                    }`}
                    item={item}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WardrobePage;
