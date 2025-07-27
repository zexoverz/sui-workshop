import { CreateMintTransactionDto, useCreateMintTransaction } from "@/hooks/use-create-mint-transaction";
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { CollectionInfo } from "@/hooks/use-get-collection-info";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { formatSUI } from "@/lib/utils";

function MintForm({
  collectionId,
  mintPrice,
}: {
  collectionId: string;
  mintPrice: number;
}) {
  const { isPending: isLoading, mutate } = useCreateMintTransaction();
  const [formData, setFormData] = useState<CreateMintTransactionDto>({
    name: "",
    description: "",
    imageFile: null as never,
    collectionId: collectionId,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateMintTransactionDto, string>>
  >({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateMintTransactionDto, string>> =
      {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!formData.imageFile) {
      newErrors.imageFile = "Image file is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          imageFile: "Please select a valid image file",
        }));
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          imageFile: "File size must be less than 10MB",
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, imageFile: file }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors.imageFile) {
        setErrors((prev) => ({ ...prev, imageFile: undefined }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    mutate([
      formData,
      mintPrice,
      () => {
        // Reset form on success
        setFormData({
          name: "",
          description: "",
          imageFile: null,
          collectionId: collectionId,
        });
        setImagePreview(null);
      },
    ]);
  };

  const handleInputChange = (
    field: keyof CreateMintTransactionDto,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 flex gap-4">
      <div className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-[#bac2de] mb-2"
          >
            NFT Name *
          </label>
          <Input
            id="name"
            type="text"
            placeholder="e.g., Cosmic Cat Supreme"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={`bg-[#313244] border-[#45475a] text-[#cdd6f4] placeholder:text-[#6c7086] ${
              errors.name ? "border-[#f38ba8]" : "focus:border-[#cba6f7]"
            }`}
          />
          {errors.name && (
            <p className="text-[#f38ba8] text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-[#bac2de] mb-2"
          >
            Description *
          </label>
          <textarea
            id="description"
            placeholder="Describe your unique cat's personality and traits..."
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 bg-[#313244] border rounded-md text-[#cdd6f4] placeholder:text-[#6c7086] resize-none focus:outline-none focus:ring-2 focus:ring-[#cba6f7]/50 ${
              errors.description
                ? "border-[#f38ba8]"
                : "border-[#45475a] focus:border-[#cba6f7]"
            }`}
          />
          {errors.description && (
            <p className="text-[#f38ba8] text-sm mt-1">{errors.description}</p>
          )}
        </div>

        <div className="bg-[#45475a]/30 rounded-lg p-4 mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#a6adc8]">Total Cost</span>
            <span className="text-xl font-bold text-[#f9e2af]">
              {formatSUI(mintPrice)} SUI
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#6c7086]">+ Gas fees</span>
            <span className="text-[#94e2d5]">~0.005 SUI</span>
          </div>
        </div>

        <Button
          id="mint-button"
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[#cba6f7] to-[#f38ba8] hover:from-[#b4a0e8] hover:to-[#f27a9a] text-[#11111b] font-semibold py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-[#11111b]/30 border-t-[#11111b] rounded-full animate-spin"></div>
              Minting...
            </div>
          ) : (
            `Mint NFT for ${formatSUI(mintPrice)} SUI`
          )}
        </Button>
      </div>

      <div>
        <label
          htmlFor="imageFile"
          className="block text-sm font-medium text-[#bac2de] mb-2"
        >
          NFT Image *
        </label>
        <div className="space-y-3 aspect-[9/16] flex max-h-96">
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview || "/placeholder.svg"}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg border border-[#45475a]"
              />
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, imageFile: null }));
                  setImagePreview(null);
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-[#f38ba8] hover:bg-[#f27a9a] text-[#11111b] rounded-full flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
          ) : (
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                errors.imageFile
                  ? "border-[#f38ba8]"
                  : "border-[#45475a] hover:border-[#cba6f7]"
              }`}
            >
              <input
                id="imageFile"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto bg-[#45475a] rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📁</span>
                </div>
                <div>
                  <p className="text-[#cdd6f4] font-medium">
                    {formData.imageFile
                      ? formData.imageFile.name
                      : "Click to upload image"}
                  </p>
                  <p className="text-[#6c7086] text-sm">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        {errors.imageFile && (
          <p className="text-[#f38ba8] text-sm mt-1">{errors.imageFile}</p>
        )}
      </div>
    </form>
  );
}

export function MintSection ({
  collectionInfo,
  id,
}: {
  collectionInfo: CollectionInfo;
  id: string;
}) {
  return (
    <Dialog modal>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-to-r from-[#cba6f7] to-[#f38ba8] hover:from-[#b4a0e8] hover:to-[#f27a9a] text-[#11111b] font-semibold py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
          Mint
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1e1e2e] min-w-max p-0">
        {collectionInfo.isActive && (
          <div className="bg-gradient-to-r from-[#cba6f7]/10 to-[#f38ba8]/10 border border-[#cba6f7]/20 rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-2xl font-semibold text-[#cba6f7] mb-2">
                  Mint Your NFT
                </h3>
                <p className="text-[#bac2de] mb-4">
                  Create your unique NFT with custom traits and personality
                </p>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#a6adc8]">Minting Progress</span>
                    <span className="text-[#cba6f7]">
                      {collectionInfo.totalSupply.toLocaleString()}/
                      {collectionInfo.maxSupply.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-[#45475a] rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-[#cba6f7] to-[#f38ba8] h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${(collectionInfo.totalSupply / collectionInfo.maxSupply) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-[#6c7086] text-sm mt-1">
                    {(
                      ((collectionInfo.maxSupply - collectionInfo.totalSupply) /
                        collectionInfo.maxSupply) *
                      100
                    ).toFixed(1)}
                    % remaining
                  </p>
                </div>
                <div className="bg-[#313244] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#a6adc8]">Mint Price</span>
                    <span className="text-2xl font-bold text-[#f9e2af]">
                      {formatSUI(collectionInfo.mintPrice)} SUI
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#6c7086]">Gas Fee (estimated)</span>
                    <span className="text-[#94e2d5]">~0.005 SUI</span>
                  </div>
                </div>
              </div>

              <MintForm
                collectionId={id}
                mintPrice={collectionInfo.mintPrice}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};