import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { productAPI } from "../../services/api"

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await productAPI.getAll(params)
      return data
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch products")
    }
  }
)

export const fetchProductById = createAsyncThunk(
  "products/fetchProductById",
  async (id, { rejectWithValue }) => {
    try {
      const data = await productAPI.getById(id)
      return data
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch product")
    }
  }
)

const initialState = {
  products: [],
  currentProduct: null,
  loading: false,
  error: null
}

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload || []
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to fetch products"
      })
      // Fetch Product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false
        state.currentProduct = action.payload
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to fetch product"
      })
  }
})

export const { setCurrentProduct, clearCurrentProduct } = productSlice.actions

export const selectAllProducts = (state) => state.products.products
export const selectCurrentProduct = (state) => state.products.currentProduct
export const selectProductsLoading = (state) => state.products.loading
export const selectProductsError = (state) => state.products.error

export default productSlice.reducer

