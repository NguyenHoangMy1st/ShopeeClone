interface Product {
  name: string
  image: string
  images: string[]
  description: string
  category: string[]
  brand?: string
  rating: number
  price: number
  price_before_discount: number
  quantity: number
  stockQuantity: number
  view: number
  sold: number
  status?: string
}
