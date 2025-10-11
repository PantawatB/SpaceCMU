import { Request, Response } from "express";
import { AppDataSource } from "../ormconfig";
import { Product } from "../entities/Product";
import { User } from "../entities/User";

interface AuthenticatedRequest extends Request {
  user?: User;
}

// GET /api/products - ดูสินค้าทั้งหมด
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const productRepo = AppDataSource.getRepository(Product);
    const products = await productRepo.find({
      order: { createdAt: "DESC" },
    });

    return res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error getting products:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// POST /api/products - เพิ่มสินค้าใหม่
export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { name, price, description } = req.body;
    const user = req.user!;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: "Name and price are required",
      });
    }

    const productRepo = AppDataSource.getRepository(Product);
    const product = productRepo.create({
      name,
      price: parseFloat(price),
      description,
      seller: user,
    });

    await productRepo.save(product);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
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
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.seller.id !== user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own products",
      });
    }

    await productRepo.remove(product);

    return res.json({
      success: true,
      message: "Product deleted successfully",
    });
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
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.seller.id !== user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own products",
      });
    }

    product.status = status;
    await productRepo.save(product);

    return res.json({
      success: true,
      message: "Product status updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error updating product status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
