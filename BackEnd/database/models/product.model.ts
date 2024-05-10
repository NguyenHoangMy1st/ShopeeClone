import mongoose, { Schema } from 'mongoose'

const ingredientSchema = new Schema({
  name: {
    type: String,
  },
  amount: {
    type: Number,
  },
})

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 160 },
    image: { type: String, required: true, maxlength: 1000 },
    images: [{ type: String, maxlength: 1000 }],
    description: { type: String },
    category: { type: mongoose.SchemaTypes.ObjectId, ref: 'categories' },
    brand: { type: mongoose.SchemaTypes.ObjectId, ref: 'brands' },
    price: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    price_before_discount: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
    uses: { type: String, default: 0 },
    ingredient: [{ type: ingredientSchema }],
    madeIn: { type: String },
    sold: { type: Number, default: 0 },
    view: { type: Number, default: 0 },
    status: { type: String },
  },
  {
    timestamps: true,
  }
)
export const ProductModel = mongoose.model('products', ProductSchema)
