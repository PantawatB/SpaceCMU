import { Request, Response } from "express";
import { AppDataSource } from "../ormconfig";
import { Product } from "../entities/Product";
import { ProductImage } from "../entities/ProductImage";
import { User } from "../entities/User";
import {
  sanitizeSeller,
  createResponse,
  listResponse,
} from "../utils/serialize";

interface AuthenticatedRequest extends Request {
  user?: User;
}

// Helper function to create absolute URL for images
const createAbsoluteImageUrl = (req: Request, relativeUrl: string): string => {
  if (!relativeUrl) return "";

  // If it's already an absolute URL (starts with http), return as is
  if (relativeUrl.startsWith("http")) {
    return relativeUrl;
  }

  // Build absolute URL using request
  const base = `${req.protocol}://${req.get("host")}`;
  const cleanUrl = relativeUrl.startsWith("/")
    ? relativeUrl
    : `/${relativeUrl}`;

  return `${base}${cleanUrl}`;
};

// Validation helper
const validateProduct = (name: string, price: any, description?: string) => {
  const errors: any = {};

  // Name validation
  if (!name || typeof name !== "string") {
    errors.name = "Name is required";
  } else if (name.length < 1 || name.length > 80) {
    errors.name = "Name must be between 1 and 80 characters";
  }

  // Price validation
  if (price === undefined || price === null || price === "") {
    errors.price = "Price is required";
  } else {
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      errors.price = "Price must be a positive number";
    }
  }

  // Description validation
  if (description !== undefined && description !== null) {
    if (typeof description !== "string") {
      errors.description = "Description must be a string";
    } else if (description.length > 500) {
      errors.description = "Description must not exceed 500 characters";
    } else {
      // Check for URLs and phone numbers
      const urlPattern =
        /(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.(com|org|net|edu|gov|mil|int|co|th|us|uk|ca|au|de|fr|jp|cn|in|br|ru|za|nl|se|no|dk|fi|it|es|pl|be|ch|at|cz|hu|gr|pt|ie|si|sk|bg|ro|hr|lt|lv|ee|lu|mt|cy))/i;
      const phonePattern =
        /(\+?\d{1,4}[\s\-]?)?(\(?\d{1,4}\)?[\s\-]?)?\d{1,4}[\s\-]?\d{1,4}[\s\-]?\d{1,9}/;

      if (urlPattern.test(description) || phonePattern.test(description)) {
        errors.description =
          "Description must not contain URLs or phone numbers";
      }
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

// GET /api/products - ดูสินค้าทั้งหมด
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const productRepo = AppDataSource.getRepository(Product);
    const products = await productRepo.find({
      order: { createdAt: "DESC" },
      relations: ["seller"],
      select: [
        "id",
        "name",
        "description",
        "price",
        "status",
        "imageUrl",
        "createdAt",
        "seller",
      ],
    });

    const sanitized = products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      status: p.status,
      imageUrl: p.imageUrl ? createAbsoluteImageUrl(req, p.imageUrl) : null,
      createdAt: p.createdAt,
      seller: sanitizeSeller((p as any).seller),
    }));

    return res.json({ data: sanitized });
  } catch (error) {
    console.error("Error getting products:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}; // GET /api/products/:id - Get product by id
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productRepo = AppDataSource.getRepository(Product);
    const product = await productRepo.findOne({
      where: { id: parseInt(id) },
      relations: ["seller", "images"],
    });

    if (!product) {
      return res.status(404).json(createResponse("Product not found", null));
    }

    return res.json(
      createResponse("Product retrieved successfully", {
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          status: product.status,
          imageUrl: product.imageUrl
            ? createAbsoluteImageUrl(req, product.imageUrl)
            : null,
          createdAt: product.createdAt,
          seller: sanitizeSeller((product as any).seller),
        },
      })
    );
  } catch (error) {
    console.error("Error getting product:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// POST /api/products - เพิ่มสินค้าใหม่ (รองรับการอัปโหลดรูปภาพ)
export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { name, price, description } = req.body;
    const user = req.user!;
    const imageFile = req.file; // รูปที่อัปโหลดมา

    // Validate input
    const validationErrors = validateProduct(name, price, description);
    if (validationErrors) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    const productRepo = AppDataSource.getRepository(Product);
    let imageUrl: string | undefined = undefined;

    // Handle image upload if provided
    if (imageFile) {
      imageUrl = `/uploads/${imageFile.filename}`;
    }

    // Create product
    const product = productRepo.create({
      name: name.trim(),
      price: parseFloat(price),
      description: description?.trim(),
      imageUrl,
      seller: user,
    });

    const savedProduct = await productRepo.save(product);

    // Return response according to API contract
    const productData = {
      id: savedProduct.id,
      name: savedProduct.name,
      description: savedProduct.description,
      price: savedProduct.price,
      status: savedProduct.status,
      imageUrl: savedProduct.imageUrl
        ? createAbsoluteImageUrl(req, savedProduct.imageUrl)
        : null,
      createdAt: savedProduct.createdAt,
      seller: sanitizeSeller(user),
    };

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: { product: productData },
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// PUT /api/products/:id - Update product
export const updateProduct = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { name, price, description } = req.body;
    const user = req.user!;
    const imageFile = req.file;

    // Validate input
    const validationErrors = validateProduct(name, price, description);
    if (validationErrors) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    const productRepo = AppDataSource.getRepository(Product);
    const product = await productRepo.findOne({
      where: { id: parseInt(id) },
      relations: ["seller"],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check ownership
    if (product.seller.id !== user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own products",
      });
    }

    // Update fields
    product.name = name.trim();
    product.price = parseFloat(price);
    product.description = description?.trim();

    // Update image if provided
    if (imageFile) {
      product.imageUrl = `/uploads/${imageFile.filename}`;
    }

    const updatedProduct = await productRepo.save(product);

    // Return response
    const productData = {
      id: updatedProduct.id,
      name: updatedProduct.name,
      description: updatedProduct.description,
      price: updatedProduct.price,
      status: updatedProduct.status,
      imageUrl: updatedProduct.imageUrl
        ? createAbsoluteImageUrl(req, updatedProduct.imageUrl)
        : null,
      createdAt: updatedProduct.createdAt,
      seller: sanitizeSeller(user),
    };

    return res.json({
      success: true,
      message: "Product updated successfully",
      data: { product: productData },
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// DELETE /api/products/:id - ลบสินค้า (เจ้าของเท่านั้น)
export const deleteProduct = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const productRepo = AppDataSource.getRepository(Product);
    const product = await productRepo.findOne({ where: { id: parseInt(id) } });

    if (!product) {
      return res.status(404).json(createResponse("Product not found", null));
    }

    if (product.seller.id !== user.id) {
      return res
        .status(403)
        .json(createResponse("You can only delete your own products", null));
    }

    await productRepo.remove(product);

    return res.json(createResponse("Product deleted successfully", null));
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// PATCH /api/products/:id/status - เปลี่ยนสถานะสินค้า
export const updateProductStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user!;

    if (!status || !["active", "sold"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'active' or 'sold'",
      });
    }

    const productRepo = AppDataSource.getRepository(Product);
    const product = await productRepo.findOne({ where: { id: parseInt(id) } });

    if (!product) {
      return res.status(404).json(createResponse("Product not found", null));
    }

    if (product.seller.id !== user.id) {
      return res
        .status(403)
        .json(createResponse("You can only update your own products", null));
    }

    product.status = status;
    await productRepo.save(product);

    return res.json(
      createResponse("Product status updated successfully", {
        product: { ...product, seller: sanitizeSeller(product.seller) },
      })
    );
  } catch (error) {
    console.error("Error updating product status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// PUT /api/products/:id/image - อัพเดทรูปภาพสินค้า
export const updateProductImage = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;
    const user = req.user!;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Image URL is required",
      });
    }

    const productRepo = AppDataSource.getRepository(Product);
    const product = await productRepo.findOne({
      where: { id: parseInt(id) },
      relations: ["seller"],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ตรวจสอบว่าเป็นเจ้าของสินค้าหรือไม่
    if (product.seller.id !== user.id) {
      return res
        .status(403)
        .json(createResponse("You can only update your own products", null));
    }

    product.imageUrl = imageUrl;
    await productRepo.save(product);

    return res.json(
      createResponse("Product image updated successfully", {
        product: { ...product, seller: sanitizeSeller(product.seller) },
      })
    );
  } catch (error) {
    console.error("Error updating product image:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
