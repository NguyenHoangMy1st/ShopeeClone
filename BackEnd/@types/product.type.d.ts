interface Product {
  name: string
  image: string
  images: string[]
  description: string
  category: string[]
  brand: Brand[]
  rating: number
  price: number
  price_before_discount: number
  quantity: number
  uses: string
  ingredient: Ingredient[]
  madeIn: string
  view: number
  sold: number
  status?: string
}
interface Ingredient {
  name: string
  amout: string
}
interface Brand {
  name: string
  image: string
  description: string
}
