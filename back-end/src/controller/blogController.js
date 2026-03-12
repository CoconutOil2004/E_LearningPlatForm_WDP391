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
    // Nếu frontend gửi JSON string
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => typeof item === "string" && item.trim() !== "");
      }
    } catch (_) {
      // Nếu chỉ là 1 string URL đơn lẻ
      if (images.trim() !== "") {
        return [images.trim()];
      }
    }
  }

  return [];
};

// Instructor tạo bài viết
const createBlog = async (req, res) => {
  try {
    const {
      title,
      summary,
      category,
      content,
      status,
      thumbnail,
      images,
    } = req.body;

    const authorId = req.user.id;

    if (!title || !summary || !category || !content) {
      return res.status(400).json({
        success: false,
        message: "Tiêu đề, tóm tắt, danh mục và nội dung là bắt buộc.",
      });
    }

    if (!isValidObjectId(category)) {
      return res.status(400).json({
        success: false,
        message: "Danh mục không hợp lệ.",
      });
    }

    const foundCategory = await Category.findById(category);
    if (!foundCategory) {
      return res.status(404).json({
        success: false,
        message: "Danh mục không tồn tại.",
      });
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

    return res.status(201).json({
      success: true,
      message: "Tạo bài viết thành công.",
      data: blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tạo bài viết.",
      error: error.message,
    });
  }
};

// Instructor cập nhật bài viết của mình
const updateOwnBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user.id;
    const {
      title,
      summary,
      category,
      content,
      status,
      thumbnail,
      images,
    } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID bài viết không hợp lệ.",
      });
    }

    const blog = await Blog.findOne({
      _id: id,
      author: instructorId,
      deleted: false,
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết của bạn.",
      });
    }

    if (category !== undefined) {
      if (!isValidObjectId(category)) {
        return res.status(400).json({
          success: false,
          message: "Danh mục không hợp lệ.",
        });
      }

      const foundCategory = await Category.findById(category);
      if (!foundCategory) {
        return res.status(404).json({
          success: false,
          message: "Danh mục không tồn tại.",
        });
      }

      blog.category = category;
    }

    if (title !== undefined) blog.title = title.trim();
    if (summary !== undefined) blog.summary = summary.trim();
    if (content !== undefined) blog.content = content.trim();

    if (thumbnail !== undefined) {
      blog.thumbnail = thumbnail ? thumbnail.trim() : "";
    }

    if (images !== undefined) {
      blog.images = parseImages(images);
    }

    // Instructor chỉ được sửa status về draft hoặc pending
    if (status !== undefined) {
      if (!["draft", "pending"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Instructor chỉ được cập nhật trạng thái draft hoặc pending.",
        });
      }
      blog.status = status;
    }

    // Nếu bài trước đó bị reject và instructor sửa lại thì xóa lý do reject
    if (blog.status === "draft" || blog.status === "pending") {
      blog.rejectedReason = "";
      blog.approvedBy = null;
      blog.approvedAt = null;
    }

    await blog.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật bài viết thành công.",
      data: blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật bài viết.",
      error: error.message,
    });
  }
};

// Instructor gửi bài chờ duyệt
const submitBlogForReview = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID bài viết không hợp lệ.",
      });
    }

    const blog = await Blog.findOne({
      _id: id,
      author: instructorId,
      deleted: false,
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết của bạn.",
      });
    }

    if (!blog.title || !blog.summary || !blog.category || !blog.content) {
      return res.status(400).json({
        success: false,
        message: "Bài viết chưa đủ thông tin để gửi duyệt.",
      });
    }

    blog.status = "pending";
    blog.rejectedReason = "";
    blog.approvedBy = null;
    blog.approvedAt = null;

    await blog.save();

    return res.status(200).json({
      success: true,
      message: "Đã gửi bài viết chờ admin duyệt.",
      data: blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi gửi bài viết duyệt.",
      error: error.message,
    });
  }
};

// Admin quản lý danh sách bài viết
const manageBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      category,
      author,
      deleted,
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
      ];
    }

    if (status) query.status = status;
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
      message: "Lỗi khi quản lý bài viết.",
      error: error.message,
    });
  }
};

// Admin duyệt bài viết
const approveBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID bài viết không hợp lệ.",
      });
    }

    const blog = await Blog.findOne({
      _id: id,
      deleted: false,
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết.",
      });
    }

    if (blog.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Chỉ bài viết đang chờ duyệt mới có thể được duyệt.",
      });
    }

    blog.status = "approved";
    blog.approvedBy = adminId;
    blog.approvedAt = new Date();
    blog.rejectedReason = "";

    await blog.save();

    return res.status(200).json({
      success: true,
      message: "Duyệt bài viết thành công.",
      data: blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi duyệt bài viết.",
      error: error.message,
    });
  }
};

// Admin từ chối bài viết
const rejectBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID bài viết không hợp lệ.",
      });
    }

    const blog = await Blog.findOne({
      _id: id,
      deleted: false,
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết.",
      });
    }

    if (blog.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Chỉ bài viết đang chờ duyệt mới có thể bị từ chối.",
      });
    }

    blog.status = "rejected";
    blog.rejectedReason = reason?.trim() || "Bài viết chưa đạt yêu cầu.";
    blog.approvedBy = null;
    blog.approvedAt = null;

    await blog.save();

    return res.status(200).json({
      success: true,
      message: "Từ chối bài viết thành công.",
      data: blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi từ chối bài viết.",
      error: error.message,
    });
  }
};

// Admin xóa mềm bài viết
const softDeleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID bài viết không hợp lệ.",
      });
    }

    const blog = await Blog.findOne({
      _id: id,
      deleted: false,
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết.",
      });
    }

    blog.deleted = true;
    blog.deletedAt = new Date();
    blog.deletedBy = adminId;

    await blog.save();

    return res.status(200).json({
      success: true,
      message: "Xóa mềm bài viết thành công.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi xóa mềm bài viết.",
      error: error.message,
    });
  }
};

// Public hoặc admin xem chi tiết bài viết
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID bài viết không hợp lệ.",
      });
    }

    const blog = await Blog.findOne({
      _id: id,
      deleted: false,
    })
      .populate("category", "name")
      .populate("author", "fullname email");

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết.",
      });
    }

    return res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy chi tiết bài viết.",
      error: error.message,
    });
  }
};

module.exports = {
  createBlog,
  updateOwnBlog,
  submitBlogForReview,
  manageBlogs,
  approveBlog,
  rejectBlog,
  softDeleteBlog,
  getBlogById,
};