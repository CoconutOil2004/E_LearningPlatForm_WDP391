import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { API_BASE_URL } from '../../../utils/constants';

export default function CreateProduct({ open, handleClose, onCreated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    image: "",
    categoryId: "",
    inventory: 0,
  });

  const [categories, setCategories] = useState([]);

  // 👉 Fetch categories khi mở dialog
  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        "${API_BASE_URL}/api/categories"
      );
      setCategories(res.data.data || res.data);
    } catch (err) {
      console.error("Fetch categories failed", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await axios.post(
        "${API_BASE_URL}/api/admin/products",
        {
          ...form,
          price: Number(form.price), // ép kiểu cho chắc
          inventory: Number(form.inventory),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      onCreated();
      handleClose();
    } catch (err) {
      console.error(err);
      alert("Create product failed");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Product</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
          />

          <TextField
            label="Description"
            name="description"
            multiline
            rows={3}
            value={form.description}
            onChange={handleChange}
          />

          <TextField
            label="Price"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
          />

          <TextField
            label="Inventory"
            name="inventory"
            type="number"
            value={form.inventory}
            onChange={handleChange}
            inputProps={{ min: 0 }}
            />

          <TextField
            label="Image URL"
            name="image"
            value={form.image}
            onChange={handleChange}
          />

          {/* CATEGORY SELECT */}
          <TextField
            select
            label="Category"
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            required
          >
            {categories.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!form.categoryId}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
