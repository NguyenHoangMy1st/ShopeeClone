// address.controller.ts
import { Request, Response } from 'express'
import { STATUS } from '../constants/status'
import { UserModel } from '../database/models/user.model'
import { ErrorHandler, responseSuccess } from '../utils/response'

const addShippingAddress = async (req: Request, res: Response) => {
  const userId = req.jwtDecoded.id
  const { street, city, postalCode, phone } = req.body

  try {
    const user: any = await UserModel.findById(userId)
    if (!user) {
      throw new ErrorHandler(STATUS.NOT_FOUND, 'User not found')
    }

    // Thêm địa chỉ giao hàng cho người dùng
    user.addresses.push({ street, city, postalCode, phone })

    await user.save()

    return responseSuccess(res, {
      message: 'Đã thêm địa chỉ giao hàng mới thành công',
      data: user,
    })
  } catch (error) {
    console.error('Error adding shipping addresses:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
const addressController = { addShippingAddress }

export default addressController
