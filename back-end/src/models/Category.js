const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    }
  },
  { timestamps: true }
);

/* Auto-generate slug from name if not provided */
categorySchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replaceAll(/\s+/g, "-")
      .replaceAll(/[^a-z0-9-]/g, "");
  }
  next();
});

module.exports = mongoose.model("Category", categorySchema);
