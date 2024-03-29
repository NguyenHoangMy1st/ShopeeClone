import { Link } from 'react-router-dom'
import { Product as ProductType } from 'src/types/product.type'

import { formatCurrency, formatNumberToSocialStyle, generateNameId } from 'src/utils/utils'
import ProductRating from 'src/components/ProductRating'
import path from 'src/constants/path'
import { useTranslation } from 'react-i18next'
interface Props {
  product: ProductType
}
export default function Product({ product }: Props) {
  const { t } = useTranslation(['home'])
  return (
    <div>
      <Link to={`${path.home}${generateNameId({ name: product.name, id: product._id })}`}>
        <div className='bg-white shadow rounded-sm hover:translate-y-[-0.04rem] hover:shadow-md duration-100 transition-transform overflow-hidden'>
          <div className='w-full pt-[100%] relative'>
            <img
              src={product.image}
              alt={product.name}
              className='absolute top-0 left-0 bg-white w-full h-full object-cover'
            />
          </div>
          <div className='p-2 overflow-hidden'>
            <div className='min-h-[2rem] line-clamp-2 text-xs'>{product.name}</div>
            <div className='flex items-center mt-3'>
              <div className='line-through max-w-[50%] text-gray-500 truncate'>
                <span className='text-xs'>₫</span>
                <span>{formatCurrency(product.price_before_discount)}</span>
              </div>
              <div className='text-red-600 truncate ml-1'>
                <span className='text-xs'>₫</span>
                <span>{formatCurrency(product.price)}</span>
              </div>
            </div>
            <div className='mt-3 flex items-center justify-end'>
              <ProductRating rating={product.rating} />
              <div className='ml-2 text-sm'>
                <span>{formatNumberToSocialStyle(product.sold)}</span>
                <span className='ml-1'>{t('sold')}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
