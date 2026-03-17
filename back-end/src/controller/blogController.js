const mongoose = require("mongoose");
const Blog = require("../models/Blog");
const Category = require("../models/Category");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const normalizeBoolean = (value) => {
  if (value === true || value === false) return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return undefined;
};

const parseImages = (images) => {
  if (images === undefined || images === null) return undefined;
  if (Array.isArray(images)) {
    return images.filter((item) => typeof item === "string" && item.trim() !== "");
  }
  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => typeof item === "string" && item.trim() !== "");
      }
    } catch (_) {
      if (images.trim() !== "") return [images.trim()];
    }
  }
  return [];
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC (không cần auth)
// ─────────────────────────────────────────────────────────────────────────────

/** GET /blogs/public  – Lấy danh sách blog đã approved */
const getPublicBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 9, search = "", category } = req.query;

    const query = { status: "approved", deleted: false };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
      ];
    }

    if (category && isValidObjectId(category)) query.category = category;

    const currentPage = Math.max(Number(page) || 1, 1);
    const pageSize = Math.max(Number(limit) || 9, 1);
    const skip = (currentPage - 1) * pageSize;

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate("category", "name")
        .populate("author", "fullname email avatar")
        .sort({ approvedAt: -1 })
        .skip(skip)
        .limit(pageSize),
      Blog.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        currentPage,
        totalPages: Math.ceil(total / pageSize),
        totalItems: total,
        pageSize,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách bài viết.",
      error: error.message,
    });
  }
};

/** GET /blogs/public/:id  – Xem chi tiết blog public + related */
const getPublicBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "ID không hợp lệ." });
    }

    const blog = await Blog.findOne({ _id: id, status: "approved", deleted: false })
      .populate("category", "name")
      .populate("author", "fullname email avatar");

    if (!blog) {
      return res.status(404).json({ success: false, message: "Không tìm thấy bài viết." });
    }

    // Related blogs cùng category
    const related = await Blog.find({
      _id: { $ne: id },
      category: blog.category?._id,
      status: "approved",
      deleted: false,
    })
      .populate("author", "fullname avatar")
      .sort({ approvedAt: -1 })
      .limit(3);

    return res.status(200).json({ success: true, data: blog, related });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi server.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCTOR
// ─────────────────────────────────────────────────────────────────────────────

const createBlog = async (req, res) => {
  try {
    const { title, summary, category, content, status, thumbnail, images } = req.body;
    const authorId = req.user.id;

    if (!title || !summary || !category || !content) {
      return res.status(400).json({
        success: false,
        message: "Tiêu đề, tóm tắt, danh mục và nội dung là bắt buộc.",
      });
    }

    if (!isValidObjectId(category)) {
      return res.status(400).json({ success: false, message: "Danh mục không hợp lệ." });
    }

    const foundCategory = await Category.findById(category);
    if (!foundCategory) {
      return res.status(404).json({ success: false, message: "Danh mục không tồn tại." });
    }

    const allowedInstructorStatus = ["draft", "pending"];
    const finalStatus = allowedInstructorStatus.includes(status) ? status : "draft";
    const parsedImages = parseImages(images);

    const blog = await Blog.create({
      title: title.trim(),
      summary: summary.trim(),
      category,
      content: content.trim(),
      status: finalStatus,
      author: authorId,
      thumbnail: thumbnail ? thumbnail.trim() : "",
      images: parsedImages || [],
    });

    return res.status(201).json({ success: true, message: "Tạo bài viết thành công.", data: blog });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi khi tạo bài viết.", error: error.message });
  }
};

const updateOwnBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user.id;
    const { title, summary, category, content, status, thumbnail, images } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "ID bài viết không hợp lệ." });
    }

    const blog = await Blog.findOne({ _id: id, author: instructorId, deleted: false });

    if (!blog) {
      return res.status(404).json({ success: false, message: "Không tìm thấy bài viết của bạn." });
    }

    if (category !== undefined) {
      if (!isValidObjectId(category)) {
        return res.status(400).json({ success: false, message: "Danh mục không hợp lệ." });
      }
      const foundCategory = await Category.findById(category);
      if (!foundCategory) {
        return res.status(404).json({ success: false, message: "Danh mục không tồn tại." });
      }
      blog.category = category;
    }

    if (title !== undefined) blog.title = title.trim();
    if (summary !== undefined) blog.summary = summary.trim();
    if (content !== undefined) blog.content = content.trim();
    if (thumbnail !== undefined) blog.thumbnail = thumbnail ? thumbnail.trim() : "";
    if (images !== undefined) blog.images = parseImages(images);

    if (status !== undefined) {
      if (!["draft", "pending"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Instructor chỉ được cập nhật trạng thái draft hoặc pending.",
        });
      }
      blog.status = status;
    }

    if (blog.status === "draft" || blog.status === "pending") {
      blog.rejectedReason = "";
      blog.approvedBy = null;
      blog.approvedAt = null;
    }

    await blog.save();
    return res.status(200).json({ success: true, message: "Cập nhật bài viết thành công.", data: blog });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi khi cập nhật bài viết.", error: error.message });
  }
};

const submitBlogForReview = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "ID bài viết không hợp lệ." });
    }

    const blog = await Blog.findOne({ _id: id, author: instructorId, deleted: false });
    if (!blog) {
      return res.status(404).json({ success: false, message: "Không tìm thấy bài viết của bạn." });
    }

    if (!blog.title || !blog.summary || !blog.category || !blog.content) {
      return res.status(400).json({ success: false, message: "Bài viết chưa đủ thông tin để gửi duyệt." });
    }

    blog.status = "pending";
    blog.rejectedReason = "";
    blog.approvedBy = null;
    blog.approvedAt = null;

    await blog.save();
    return res.status(200).json({ success: true, message: "Đã gửi bài viết chờ admin duyệt.", data: blog });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi khi gửi bài viết duyệt.", error: error.message });
  }
};

/** DELETE /blogs/:id  – Instructor xóa blog của mình (soft delete hoặc hard nếu draft) */
const deleteOwnBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "ID bài viết không hợp lệ." });
    }

    const blog = await Blog.findOne({ _id: id, author: instructorId, deleted: false });
    if (!blog) {
      return res.status(404).json({ success: false, message: "Không tìm thấy bài viết của bạn." });
    }

    // Chỉ cho xóa khi draft hoặc rejected
    if (!["draft", "rejected"].includes(blog.status)) {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể xóa bài viết đang ở trạng thái draft hoặc rejected.",
      });
    }

    blog.deleted = true;
    blog.deletedAt = new Date();
    blog.deletedBy = instructorId;
    await blog.save();

    return res.status(200).json({ success: true, message: "Xóa bài viết thành công." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi khi xóa bài viết.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────────────────────────────────────

const manageBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status, category, author, deleted } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
      ];
    }

    if (status) query.status = status;
    else query.status = { $ne: "draft" };
    if (category && isValidObjectId(category)) query.category = category;
    if (author && isValidObjectId(author)) query.author = author;

    const deletedValue = normalizeBoolean(deleted);
    query.deleted = deletedValue !== undefined ? deletedValue : false;

    const currentPage = Math.max(Number(page) || 1, 1);
    const pageSize = Math.max(Number(limit) || 10, 1);
    const skip = (currentPage - 1) * pageSize;

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate("category", "name")
        .populate("author", "fullname email")
        .populate("approvedBy", "fullname email")
        .populate("deletedBy", "fullname email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      Blog.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách quản lý bài viết thành công.",
      data: blogs,
      pagination: { currentPage, totalPages: Math.ceil(total / pageSize), totalItems: total, pageSize },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi khi quản lý bài viết.", error: error.message });
  }
};

const approveBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "ID bài viết không hợp lệ." });
    }

    const blog = await Blog.findOne({ _id: id, deleted: false });
    if (!blog) return res.status(404).json({ success: false, message: "Không tìm thấy bài viết." });
    if (blog.status !== "pending") {
      return res.status(400).json({ success: false, message: "Chỉ bài viết đang chờ duyệt mới có thể được duyệt." });
    }

    blog.status = "approved";
    blog.approvedBy = adminId;
    blog.approvedAt = new Date();
    blog.rejectedReason = "";

    await blog.save();
    return res.status(200).json({ success: true, message: "Duyệt bài viết thành công.", data: blog });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi khi duyệt bài viết.", error: error.message });
  }
};

const rejectBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "ID bài viết không hợp lệ." });
    }

    const blog = await Blog.findOne({ _id: id, deleted: false });
    if (!blog) return res.status(404).json({ success: false, message: "Không tìm thấy bài viết." });
    if (blog.status !== "pending") {
      return res.status(400).json({ success: false, message: "Chỉ bài viết đang chờ duyệt mới có thể bị từ chối." });
    }

    blog.status = "rejected";
    blog.rejectedReason = reason?.trim() || "Bài viết chưa đạt yêu cầu.";
    blog.approvedBy = null;
    blog.approvedAt = null;

    await blog.save();
    return res.status(200).json({ success: true, message: "Từ chối bài viết thành công.", data: blog });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi khi từ chối bài viết.", error: error.message });
  }
};

const softDeleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "ID bài viết không hợp lệ." });
    }

    const blog = await Blog.findOne({ _id: id, deleted: false });
    if (!blog) return res.status(404).json({ success: false, message: "Không tìm thấy bài viết." });

    blog.deleted = true;
    blog.deletedAt = new Date();
    blog.deletedBy = adminId;

    await blog.save();
    return res.status(200).json({ success: true, message: "Xóa mềm bài viết thành công." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi khi xóa mềm bài viết.", error: error.message });
  }
};

const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "ID bài viết không hợp lệ." });
    }

    const blog = await Blog.findOne({ _id: id, deleted: false })
      .populate("category", "name")
      .populate("author", "fullname email");

    if (!blog) return res.status(404).json({ success: false, message: "Không tìm thấy bài viết." });

    return res.status(200).json({ success: true, data: blog });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi khi lấy chi tiết bài viết.", error: error.message });
  }
};

const getMyBlogs = async (req, res) => {
  try {
    const instructorId = req.user.id;
    const { page = 1, limit = 10, search = "", status, category } = req.query;

    const query = { author: instructorId, deleted: false };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
      ];
    }

    if (status) query.status = status;
    if (category && isValidObjectId(category)) query.category = category;

    const currentPage = Math.max(Number(page) || 1, 1);
    const pageSize = Math.max(Number(limit) || 10, 1);
    const skip = (currentPage - 1) * pageSize;

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate("category", "name")
        .populate("author", "fullname email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      Blog.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách bài viết thành công.",
      data: blogs,
      pagination: { currentPage, totalPages: Math.ceil(total / pageSize), totalItems: total, pageSize },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách bài viết.", error: error.message });
  }
};

module.exports = {
  // Public
  getPublicBlogs,
  getPublicBlogById,
  // Instructor
  createBlog,
  updateOwnBlog,
  submitBlogForReview,
  deleteOwnBlog,
  getMyBlogs,
  // Admin
  manageBlogs,
  approveBlog,
  rejectBlog,
  softDeleteBlog,
  getBlogById,
};