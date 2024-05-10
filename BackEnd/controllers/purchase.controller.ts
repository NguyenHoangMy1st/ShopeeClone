import { Request, Response } from 'express'
import { STATUS_PURCHASE } from '../constants/purchase'
import { STATUS } from '../constants/status'
import { ProductModel } from '../database/models/product.model'
import { PurchaseModel } from '../database/models/purchase.model'
import { ErrorHandler, responseError, responseSuccess } from '../utils/response'
import { handleImageProduct } from './product.controller'
import { cloneDeep } from 'lodash'

export const addToCart = async (req: Request, res: Response) => {
  const listOrder = req.body
  const purchaseInDb: any = await PurchaseModel.findOne({
    user: req.jwtDecoded.id,
    status: STATUS_PURCHASE.IN_CART,
  }).populate({
    path: 'order',
    populate: {
      path: 'product',
    },
  })

  if (!purchaseInDb) {
    const myOrder = purchaseInDb?.order || []
    for (const order of listOrder) {
      const { product_id, buy_count } = order
      const product: any = await ProductModel.findById(product_id).lean()
      if (product) {
        if (buy_count > product.quantity) {
          throw new ErrorHandler(
            STATUS.NOT_ACCEPTABLE,
            'Số lượng vượt quá số lượng sản phẩm'
          )
        }
      }

      myOrder.push({
        product: product,
        buy_count,
      })
    }

    const price = myOrder?.reduce((a, b) => {
      return a + b?.product?.price * Number(b.buy_count)
    }, 0)

    const price_before_discount = myOrder?.reduce((a, b) => {
      return a + b?.product?.price_before_discount * Number(b.buy_count)
    }, 0)

    const purchase = {
      user: req.jwtDecoded.id,
      order: myOrder?.map((item) => ({
        product: item?.product?._id,
        buy_count: item?.buy_count,
      })),
      price,
      price_before_discount,
      status: STATUS_PURCHASE.IN_CART,
    }

    const addedPurchase = await new PurchaseModel(purchase).save()
    const data = await PurchaseModel.findById(addedPurchase._id).populate({
      path: 'order',
      populate: {
        path: 'product',
      },
    })

    const response = {
      message: 'Thêm sản phẩm vào giỏ hàng thành công',
      data,
    }
    return responseSuccess(res, response)
  }

  const myOrder = purchaseInDb?.order || []

  for (const order of listOrder) {
    const { product_id, buy_count } = order
    const product: any = await ProductModel.findById(product_id).lean()
    if (product) {
      if (buy_count > product.quantity) {
        throw new ErrorHandler(
          STATUS.NOT_ACCEPTABLE,
          'Số lượng vượt quá số lượng sản phẩm'
        )
      }
    }

    const existingOrder = myOrder?.find(
      (item) => item?.product?._id?.toString() === product_id?.toString()
    )

    if (!existingOrder) {
      myOrder.push({
        product: product,
        buy_count,
      })
    } else {
      existingOrder.buy_count += buy_count
    }
  }

  const price = myOrder?.reduce((a, b) => {
    return a + b?.product?.price * Number(b.buy_count)
  }, 0)

  const price_before_discount = myOrder?.reduce((a, b) => {
    return a + b?.product?.price_before_discount * Number(b.buy_count)
  }, 0)

  const payload = {
    price,
    price_before_discount,
    order: myOrder?.map((item) => ({
      product: item?.product?._id,
      buy_count: item?.buy_count,
    })),
  }

  console.log(myOrder)
  console.log(payload)
  console.log(purchaseInDb._id)

  const data = await PurchaseModel.findByIdAndUpdate(
    purchaseInDb._id,
    {
      price,
      price_before_discount,
      order: myOrder?.map((item) => ({
        product: item?.product?._id,
        buy_count: item?.buy_count,
      })),
    },
    { new: true }
  )

  const response = {
    message: 'Thêm sản phẩm vào giỏ hàng thành công',
    data,
  }
  return responseSuccess(res, response)
}

export const updatePurchase = async (req: Request, res: Response) => {
  const { product_id, buy_count } = req.body
  const purchaseInDb: any = await PurchaseModel.findOne({
    user: req.jwtDecoded.id,
    status: STATUS_PURCHASE.IN_CART,
    product: {
      _id: product_id,
    },
  })
    .populate({
      path: 'product',
      populate: {
        path: 'category',
      },
    })
    .lean()
  if (purchaseInDb) {
    if (buy_count > purchaseInDb.product.quantity) {
      throw new ErrorHandler(
        STATUS.NOT_ACCEPTABLE,
        'Số lượng vượt quá số lượng sản phẩm'
      )
    }
    const data = await PurchaseModel.findOneAndUpdate(
      {
        user: req.jwtDecoded.id,
        status: STATUS_PURCHASE.IN_CART,
        product: {
          _id: product_id,
        },
      },
      {
        buy_count,
      },
      {
        new: true,
      }
    )
      .populate({
        path: 'product',
        populate: {
          path: 'category',
        },
      })
      .lean()
    const response = {
      message: 'Cập nhật đơn thành công',
      data,
    }
    return responseSuccess(res, response)
  } else {
    throw new ErrorHandler(STATUS.NOT_FOUND, 'Không tìm thấy đơn')
  }
}

export const buyProducts = async (req: Request, res: Response) => {
  const purchases = []
  for (const item of req.body) {
    const product: any = await ProductModel.findById(item.product_id).lean()
    if (product) {
      if (item.buy_count > product.quantity) {
        throw new ErrorHandler(
          STATUS.NOT_ACCEPTABLE,
          'Số lượng mua vượt quá số lượng sản phẩm'
        )
      } else {
        let data = await PurchaseModel.findOneAndUpdate(
          {
            user: req.jwtDecoded.id,
            status: STATUS_PURCHASE.IN_CART,
            product: {
              _id: item.product_id,
            },
          },
          {
            buy_count: item.buy_count,
            status: STATUS_PURCHASE.WAIT_FOR_CONFIRMATION,
          },
          {
            new: true,
          }
        )
          .populate({
            path: 'product',
            populate: {
              path: 'category',
            },
          })
          .lean()
        if (!data) {
          const purchase = {
            user: req.jwtDecoded.id,
            product: item.product_id,
            buy_count: item.buy_count,
            price: product.price,
            price_before_discount: product.price_before_discount,
            status: STATUS_PURCHASE.WAIT_FOR_CONFIRMATION,
          }
          const addedPurchase = await new PurchaseModel(purchase).save()
          data = await PurchaseModel.findById(addedPurchase._id).populate({
            path: 'product',
            populate: {
              path: 'category',
            },
          })
        }
        purchases.push(data)
      }
    } else {
      throw new ErrorHandler(STATUS.NOT_FOUND, 'Không tìm thấy sản phẩm')
    }
  }
  const response = {
    message: 'Mua thành công',
    data: purchases,
  }
  return responseSuccess(res, response)
}
export const getPurchases = async (req: Request, res: Response) => {
  const { status = STATUS_PURCHASE.ALL, user_id } = req.query

  let condition: any = {
    ...(user_id && { user: user_id }),
    status: STATUS_PURCHASE.ALL,
  }

  if (Number(status) !== STATUS_PURCHASE.ALL) {
    condition.status = status
  }

  try {
    let purchases: any = await PurchaseModel.find(condition)
      .populate({
        path: 'order',
        populate: {
          path: 'product',
        },
      })
      .sort({
        createdAt: -1,
      })
      .lean()

    // Handle image product
    purchases = purchases.map((purchase: any) => {
      if (purchase.product) {
        purchase.product = handleImageProduct(cloneDeep(purchase.product))
      }
      return purchase
    })

    const response = {
      message: 'Lấy đơn mua thành công',
      data: purchases,
    }
    return responseSuccess(res, response)
  } catch (error) {
    return responseError(res, 'Lỗi khi lấy đơn mua')
  }
}

export const deletePurchases = async (req: Request, res: Response) => {
  const purchase_ids = req.body
  const user_id = req.jwtDecoded.id
  const deletedData = await PurchaseModel.deleteMany({
    user: user_id,
    status: STATUS_PURCHASE.IN_CART,
    _id: { $in: purchase_ids },
  })
  return responseSuccess(res, {
    message: `Xoá ${deletedData.deletedCount} đơn thành công`,
    data: { deleted_count: deletedData.deletedCount },
  })
}
