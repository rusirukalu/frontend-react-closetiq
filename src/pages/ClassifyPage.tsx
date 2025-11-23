// src/pages/ClassifyPage.tsx – Updated with automatic wardrobe addition
import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  Fragment,
} from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Camera,
  Loader2,
  Sparkles,
  Brain,
  Eye,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ImageIcon,
  Plus,
  Shirt,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  classifyImageOnly,
  classifyAndAddItem,
  findSimilarClothingItems,
  clearClassificationResult,
  clearError,
} from "@/store/slices/clothingSlice";
import { fetchWardrobes } from "@/store/slices/wardrobeSlice";
import toast from "react-hot-toast";

/***************************
 *   Domain Types (unchanged)
 ***************************/
export interface Classification {
  predicted_class?: string;
  confidence?: number;
  all_predictions?: Array<{ class: string; confidence: number }>;
}
export interface AttributeItem {
  attribute?: string;
  confidence?: number;
  percentage?: number;
  name?: string;
}
export interface AttributeAnalysis {
  attributes?: Record<string, AttributeItem[]>;
  confidence_scores?: Record<string, number>;
  overall_confidence?: number;
  enhanced_analysis?: {
    dominant_colors?: string[];
    patterns?: Record<string, any>;
    structural_features?: Record<string, any>;
    texture_features?: Record<string, any>;
  };
}
export interface ImageQuality {
  grade?: string;
  overall_score?: number;
  component_scores?: Record<string, number>;
  recommendations?: string[];
}
export interface ClassificationResult {
  classification?: Classification;
  attributes?: AttributeAnalysis;
  image_quality?: ImageQuality;
  processing_time_ms?: number;
  model_version?: string;
  timestamp?: string;
}

/***************************
 *   UI Helpers
 ***************************/
const classNames = (...cl: (string | undefined | boolean)[]) =>
  cl.filter(Boolean).join(" ");

/** Generic Section wrapper to cut markup repetition */
const SectionCard: React.FC<{
  id?: string;
  icon: React.ReactNode;
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}> = ({ id, icon, title, right, children }) => (
  <Card
    id={id}
    className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
  >
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
        {icon}
        {title}
        {right && <span className="ml-auto">{right}</span>}
      </CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const ErrorBox: React.FC<{
  msg: string;
  retry: () => void;
  clear: () => void;
  reset: () => void;
  busy: boolean;
}> = ({ msg, retry, clear, reset, busy }) => (
  <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg flex items-start gap-3">
    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
    <div className="flex-1 text-sm text-red-700 dark:text-red-300">
      <p className="font-medium">Classification Error</p>
      <p>{msg}</p>
      <div className="flex gap-2 mt-3">
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={retry}
          className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-600 hover:bg-red-200 dark:hover:bg-red-800"
        >
          <RefreshCw className="h-4 w-4 mr-1" /> Retry
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          className="text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800"
        >
          <X className="h-4 w-4 mr-1" /> Start Over
        </Button>
      </div>
    </div>
    <Button
      variant="ghost"
      size="sm"
      onClick={clear}
      className="text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800"
    >
      <X className="h-4 w-4" />
    </Button>
  </div>
);

/***************************
 *   Main Component
 ***************************/
const ClassifyPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    isClassifying,
    classificationResult,
    similarItems,
    error,
    isLoading,
  } = useAppSelector((s) => s.clothing);
  const { currentWardrobe, wardrobes } = useAppSelector((s) => s.wardrobe);
  const { user } = useAppSelector((s) => s.auth);

  // Local UI state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAddingToWardrobe, setIsAddingToWardrobe] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [itemAddedSuccessfully, setItemAddedSuccessfully] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Safe wardrobe checks
  const safeWardrobes = Array.isArray(wardrobes) ? wardrobes : [];

  // ✅ Load wardrobes on mount
  useEffect(() => {
    if (user?.id && safeWardrobes.length === 0) {
      dispatch(fetchWardrobes());
    }
  }, [dispatch, user?.id, safeWardrobes.length]);

  /*******************
   *  Safe getters  *
   *******************/
  const getClassification = (): Classification =>
    classificationResult?.classification || {};
  const getPredictedClass = () =>
    (getClassification().predicted_class || "unknown").replace(/_/g, " ");
  const getConfidence = () => getClassification().confidence || 0;
  const getTopPredictions = () => getClassification().all_predictions || [];
  const getAttributes = () => classificationResult?.attributes || {};
  const getImageQuality = () => classificationResult?.image_quality || {};
  const hasValidClassification = () =>
    !!(
      getClassification().predicted_class &&
      typeof getClassification().confidence === "number"
    );
  const currentError = localError || error;

  /*******************
   *  File Handlers  *
   *******************/
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const validateFile = (file: File) => {
    if (!allowedTypes.includes(file.type))
      return "Upload a valid image (JPEG, PNG, GIF, WebP)";
    if (file.size > 16 * 1024 * 1024) return "File must be < 16 MB";
    return null;
  };
  const handleFileSelect = useCallback(
    (file: File) => {
      const err = validateFile(file);
      if (err) return toast.error(err);
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
      dispatch(clearClassificationResult());
      dispatch(clearError());
      setLocalError(null);
      setItemAddedSuccessfully(false);
      toast.success("Image loaded!");
    },
    [dispatch]
  );
  const onInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    e.target.files?.[0] && handleFileSelect(e.target.files[0]);
  const onDrag = useCallback((e: React.DragEvent, over: boolean) => {
    e.preventDefault();
    setIsDragOver(over);
  }, []);
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      e.dataTransfer.files[0] && handleFileSelect(e.dataTransfer.files[0]);
    },
    [handleFileSelect]
  );

  /*******************
   *  AI Actions      *
   *******************/
  // ✅ UPDATED: Modified to automatically add to wardrobe after classification
  const classifyAndAutoAdd = async () => {
    if (!selectedImage) return toast.error("Select an image first");

    setIsAnalyzing(true);
    setIsAddingToWardrobe(false);
    setLocalError(null);
    setItemAddedSuccessfully(false);

    // ✅ Check if we should auto-add to wardrobe
    const shouldAutoAdd = currentWardrobe && user?.id;

    const toastId = toast.loading(
      shouldAutoAdd ? "Analyzing and adding to wardrobe..." : "Analyzing..."
    );

    try {
      if (shouldAutoAdd) {
        // ✅ Use classifyAndAddItem for automatic addition
        setIsAddingToWardrobe(true);
        await dispatch(
          classifyAndAddItem({
            file: selectedImage,
            wardrobeId: currentWardrobe._id,
          })
        ).unwrap();

        toast.success(
          `✅ Item analyzed and added to "${currentWardrobe.name}"!`,
          { id: toastId, duration: 4000 }
        );
        setItemAddedSuccessfully(true);

        // ✅ Still scroll to results to show classification
        setTimeout(
          () =>
            document
              .getElementById("classification-results")
              ?.scrollIntoView({ behavior: "smooth" }),
          100
        );
      } else {
        // ✅ Just classify without adding
        const res = await dispatch(classifyImageOnly(selectedImage)).unwrap();
        if (!res?.classification) throw new Error("Invalid AI response");

        if (!currentWardrobe) {
          toast.success(
            "Classification complete! Select a wardrobe to add the item.",
            {
              id: toastId,
              duration: 4000,
            }
          );
        } else {
          toast.success("Classification complete!", { id: toastId });
        }

        setTimeout(
          () =>
            document
              .getElementById("classification-results")
              ?.scrollIntoView({ behavior: "smooth" }),
          100
        );
      }
    } catch (err: any) {
      const msg =
        typeof err === "string"
          ? err
          : err?.message?.includes("503")
          ? "AI service unavailable. Try again soon."
          : err?.message ||
            (shouldAutoAdd
              ? "Classification or adding failed"
              : "Classification failed");
      setLocalError(msg);
      toast.error(msg, { id: toastId });
    } finally {
      setIsAnalyzing(false);
      setIsAddingToWardrobe(false);
    }
  };

  // ✅ Separate manual add function for cases where auto-add didn't happen
  const manualAddToWardrobe = async () => {
    if (!selectedImage || !currentWardrobe)
      return toast.error("Select image & wardrobe first");
    if (!hasValidClassification())
      return toast.error("Classify the image first");

    setIsAddingToWardrobe(true);
    const toastId = toast.loading("Adding to wardrobe...");
    try {
      await dispatch(
        classifyAndAddItem({
          file: selectedImage,
          wardrobeId: currentWardrobe._id,
        })
      ).unwrap();
      toast.success(`Added to "${currentWardrobe.name}"!`, { id: toastId });
      setItemAddedSuccessfully(true);
    } catch (err: any) {
      toast.error(err?.message || "Add failed", { id: toastId });
    } finally {
      setIsAddingToWardrobe(false);
    }
  };

  const findSimilar = async () => {
    if (!hasValidClassification()) return toast.error("Classify first");
    const toastId = toast.loading("Searching similar...");
    try {
      await dispatch(findSimilarClothingItems(getPredictedClass())).unwrap();
      toast.success(`Found ${similarItems?.length || 0} items`, {
        id: toastId,
      });
    } catch (err: any) {
      toast.error(err?.message || "Search failed", { id: toastId });
    }
  };

  /*******************
   *  Reset / Retry   *
   *******************/
  const resetForm = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setIsAnalyzing(false);
    setIsAddingToWardrobe(false);
    setLocalError(null);
    setItemAddedSuccessfully(false);
    dispatch(clearClassificationResult());
    dispatch(clearError());
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /*******************
   *  UI Subsections  *
   *******************/
  const PredictionsSection = () => (
    <Fragment>
      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
            {getPredictedClass()}
          </h3>
          <Badge className="bg-blue-600 dark:bg-blue-500 text-white font-semibold">
            {(getConfidence() * 100).toFixed(1)}%
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-3">
            <div
              className={classNames(
                "h-3 rounded-full transition-all",
                getConfidence() > 0.8
                  ? "bg-green-500"
                  : getConfidence() > 0.6
                  ? "bg-blue-500"
                  : getConfidence() > 0.4
                  ? "bg-yellow-500"
                  : "bg-red-500"
              )}
              style={{ width: `${Math.max(getConfidence() * 100, 5)}%` }}
            />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Confidence
          </span>
        </div>
      </div>

      {getTopPredictions().length > 1 && (
        <div className="space-y-2 mt-4">
          <h4 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Sparkles className="h-4 w-4" /> Other Predictions
          </h4>
          {getTopPredictions()
            .slice(1, 4)
            .map((p, i) => (
              <div
                key={i}
                className="flex justify-between p-3 bg-gray-100 dark:bg-gray-600 rounded-lg"
              >
                <span className="capitalize text-sm">
                  {p.class.replace(/_/g, " ")}
                </span>
                <Badge
                  variant="outline"
                  className="text-xs text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                >
                  {(p.confidence * 100).toFixed(1)}%
                </Badge>
              </div>
            ))}
        </div>
      )}
    </Fragment>
  );

  const AttributeSection = () => {
    const attrs = getAttributes();
    const attrEntries = Object.entries(attrs.attributes || {});
    const renderValue = (item: any) =>
      typeof item === "string"
        ? item
        : item?.attribute || item?.name || String(item);
    const getConf = (item: any) =>
      typeof item === "object" && item !== null
        ? item.confidence || (item.percentage ? item.percentage / 100 : null)
        : null;

    if (!attrEntries.length) return null;
    return (
      <div className="space-y-3 mt-6">
        <h4 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <Brain className="h-4 w-4" /> AI‑Detected Attributes
        </h4>
        <div className="grid gap-3">
          {attrEntries.map(([k, list]: [string, any]) => (
            <div
              key={k}
              className="p-3 bg-gray-100 dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium capitalize">
                  {k.replace(/_/g, " ")}
                </span>
                <div className="ml-2 flex-1 space-y-1">
                  {(list as AttributeItem[]).slice(0, 3).map((it, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between bg-white dark:bg-gray-700 rounded p-2"
                    >
                      <Badge variant="secondary" className="text-xs">
                        {renderValue(it)}
                      </Badge>
                      {getConf(it) && (
                        <span className="text-xs text-gray-500">
                          {(getConf(it)! * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  ))}
                  {list.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{list.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
              {attrs.confidence_scores?.[k] && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Overall: {(attrs.confidence_scores[k] * 100).toFixed(0)}%
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const QualitySection = () => {
    const q = getImageQuality();
    if (q.overall_score === undefined) return null;
    return (
      <div className="space-y-3 mt-6">
        <h4 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <Camera className="h-4 w-4" /> Image Quality
        </h4>
        <div className="flex justify-between p-3 bg-gray-100 dark:bg-gray-600 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Overall Score
          </span>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={classNames(
                    "w-2 h-2 rounded-full",
                    i < q.overall_score! * 10
                      ? "bg-blue-500 dark:bg-blue-400"
                      : "bg-gray-300 dark:bg-gray-500"
                  )}
                />
              ))}
            </div>
            <Badge className="bg-blue-600 dark:bg-blue-500 text-white">
              {(q.overall_score! * 10).toFixed(1)}/10
            </Badge>
          </div>
        </div>
        {q.grade && (
          <div className="text-center">
            <Badge variant="outline" className="text-sm">
              Quality: {q.grade}
            </Badge>
          </div>
        )}
        {q.recommendations?.length && (
          <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
            {q.recommendations.map((r: string, i: number) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  const SimilarSection = () => {
    if (!similarItems?.length) return null;
    return (
      <SectionCard
        icon={<Sparkles className="h-5 w-5" />}
        title="Similar Items Found"
        right={
          <Badge
            variant="outline"
            className="text-blue-600 dark:text-blue-500 border-blue-600 dark:border-blue-500"
          >
            {similarItems.length}
          </Badge>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {similarItems.map((it, i) => (
            <div
              key={i}
              className="border border-gray-200 dark:border-gray-600 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium truncate">
                {it.name || "Unnamed"}
              </p>
              <div className="flex justify-between mt-1 text-xs">
                <Badge variant="secondary" className="bg-blue-600 text-white">
                  {((it.similarity || it.similarity_score || 0) * 100).toFixed(
                    1
                  )}
                  %
                </Badge>
                <span className="capitalize text-gray-500">
                  {it.category || "Unknown"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    );
  };

  /*******************
   *   useEffect for debug (unchanged)
   *******************/
  useEffect(() => {
    if (classificationResult && !classificationResult.classification)
      setLocalError("Invalid classification result received");
  }, [classificationResult]);

  /*******************
   *   Render
   *******************/
  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-gray-100">
            <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400" /> AI
            Fashion Classifier
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload an image to identify your fashion item with AI
            {currentWardrobe && (
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {" "}
                → automatically adds to "{currentWardrobe.name}"
              </span>
            )}
          </p>

          {/* ✅ Wardrobe Status */}
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              AI Service Connected
            </div>
            {currentWardrobe ? (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Shirt className="h-4 w-4" />
                Auto-adding to:{" "}
                <span className="font-medium">{currentWardrobe.name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                <AlertCircle className="h-4 w-4" />
                Select a wardrobe for auto-add
              </div>
            )}
          </div>

          {currentError && (
            <ErrorBox
              msg={currentError}
              retry={classifyAndAutoAdd}
              clear={() => dispatch(clearError())}
              reset={resetForm}
              busy={isAnalyzing || isClassifying || isAddingToWardrobe}
            />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <SectionCard
            icon={<Upload className="h-5 w-5" />}
            title="Upload Image"
          >
            {!imagePreview ? (
              <div
                className={classNames(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-all",
                  isDragOver
                    ? "border-blue-400 bg-blue-100 dark:bg-blue-900"
                    : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
                )}
                onDragOver={(e) => onDrag(e, true)}
                onDragLeave={(e) => onDrag(e, false)}
                onDrop={onDrop}
              >
                {isDragOver ? (
                  <ImageIcon className="h-12 w-12 text-blue-500 mb-4" />
                ) : (
                  <Camera className="h-12 w-12 text-gray-400 mb-4" />
                )}
                <p className="text-lg font-medium">
                  {isDragOver ? "Drop the image" : "Upload a fashion item"}
                </p>
                <p className="text-gray-500 text-sm">
                  PNG, JPG, JPEG, GIF, WebP up to 16 MB
                </p>
                <div className="mt-6">
                  <label className="cursor-pointer inline-flex items-center bg-blue-600 text-white hover:bg-blue-700 rounded-md px-6 py-2 text-sm font-medium">
                    <Upload className="mr-2 h-4 w-4" /> Choose File
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onInput}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">or drag & drop</p>
                </div>
              </div>
            ) : (
              <Fragment>
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Selected"
                    className="w-full h-64 object-cover rounded-lg shadow-sm"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    {itemAddedSuccessfully && (
                      <Badge className="bg-green-600 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" /> Added to
                        Wardrobe
                      </Badge>
                    )}
                    <Badge className="bg-blue-600 text-white">
                      <ImageIcon className="h-3 w-3 mr-1" /> Ready
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetForm}
                      className="bg-white/80 hover:bg-gray-100 dark:bg-gray-800/80"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {selectedImage && (
                    <Badge
                      variant="outline"
                      className="absolute bottom-2 left-2 bg-white/80 dark:bg-gray-800/80"
                    >
                      {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  {/* ✅ UPDATED: Button text changes based on wardrobe selection */}
                  <Button
                    onClick={classifyAndAutoAdd}
                    disabled={
                      isClassifying || isAnalyzing || isAddingToWardrobe
                    }
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {isClassifying || isAnalyzing || isAddingToWardrobe ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : currentWardrobe ? (
                      <Plus className="mr-2 h-4 w-4" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    {isAddingToWardrobe
                      ? "Adding..."
                      : isAnalyzing || isClassifying
                      ? "Analyzing..."
                      : currentWardrobe
                      ? "Analyze & Add to Wardrobe"
                      : "Analyze Only"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    className="border-gray-300 hover:bg-gray-100"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </Fragment>
            )}
          </SectionCard>

          {/* Results */}
          <SectionCard
            id="classification-results"
            icon={<Eye className="h-5 w-5" />}
            title="AI Classification Results"
            right={
              hasValidClassification() && (
                <div className="flex gap-2">
                  {itemAddedSuccessfully && (
                    <Badge className="bg-green-600 text-white">
                      <CheckCircle className="h-3 w-3 mr-1" /> In Wardrobe
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className="border-blue-600 text-blue-600"
                  >
                    <CheckCircle className="h-3 w-3 mr-1 text-green-600" />{" "}
                    Analyzed
                  </Badge>
                </div>
              )
            }
          >
            {!hasValidClassification() ? (
              <div className="text-center py-8 text-gray-700 dark:text-gray-300">
                <Brain className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                Upload & analyze an image to see AI‑powered results.
              </div>
            ) : (
              <Fragment>
                <PredictionsSection />
                <AttributeSection />
                <QualitySection />

                {/* Timing & model */}
                {classificationResult?.processing_time_ms && (
                  <div className="pt-4 border-t text-xs text-gray-500 mt-6">
                    <div className="flex justify-between">
                      <span>Processing Time</span>
                      <span>
                        {(
                          classificationResult.processing_time_ms / 1000
                        ).toFixed(2)}
                        s
                      </span>
                    </div>
                    {classificationResult.model_version && (
                      <div className="flex justify-between">
                        <span>Model Version</span>
                        <span>{classificationResult.model_version}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* ✅ UPDATED: Action Buttons - only show manual add if auto-add didn't happen */}
                <div className="pt-4 border-t mt-6 flex flex-col gap-3">
                  {!itemAddedSuccessfully &&
                    currentWardrobe &&
                    hasValidClassification() && (
                      <Button
                        onClick={manualAddToWardrobe}
                        disabled={isLoading || isAddingToWardrobe}
                        className="w-full bg-green-600 text-white hover:bg-green-700"
                      >
                        {isAddingToWardrobe ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="mr-2 h-4 w-4" />
                        )}
                        Add to "{currentWardrobe.name}"
                      </Button>
                    )}

                  {!currentWardrobe && hasValidClassification() && (
                    <div className="w-full p-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg text-center">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <AlertCircle className="inline h-4 w-4 mr-1" />
                        Select a wardrobe from the navigation to add this item
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={findSimilar}
                      disabled={
                        similarItems?.length > 0 || !hasValidClassification()
                      }
                      className="border-gray-300 hover:bg-gray-100"
                    >
                      <Sparkles className="mr-2 h-4 w-4" /> Find Similar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={resetForm}
                      className="border-gray-300 hover:bg-gray-100"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> New Image
                    </Button>
                  </div>
                </div>
              </Fragment>
            )}
          </SectionCard>
        </div>

        {/* Similar Items */}
        <SimilarSection />

        {/* Model Info */}
        <SectionCard
          icon={<Brain className="h-6 w-6 text-blue-600" />}
          title="Powered by Smart ClosetIQ"
        >
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Our AI is trained on thousands of items for accurate classification.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { label: "Categories", value: "15+", color: "text-blue-600" },
              { label: "Accuracy", value: "97%", color: "text-purple-600" },
              { label: "Analysis Time", value: "<2s", color: "text-green-600" },
              { label: "Auto-Add", value: "Smart", color: "text-orange-600" },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="p-3 bg-white dark:bg-gray-700 rounded-lg"
              >
                <div className={classNames("text-2xl font-semibold", color)}>
                  {value}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Dev Debug */}
        {process.env.NODE_ENV === "development" && classificationResult && (
          <SectionCard icon={<AlertCircle className="h-5 w-5" />} title="Debug">
            <details>
              <summary className="cursor-pointer text-sm mb-2">
                Raw result
              </summary>
              <pre className="text-xs overflow-auto max-h-60 bg-white dark:bg-gray-900 p-4 rounded border">
                {JSON.stringify(classificationResult, null, 2)}
              </pre>
            </details>
          </SectionCard>
        )}
      </div>
    </div>
  );
};

export default ClassifyPage;
