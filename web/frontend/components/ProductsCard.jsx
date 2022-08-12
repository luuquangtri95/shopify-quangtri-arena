import { useState } from 'react'
import { Card, Heading, TextContainer, DisplayText, TextStyle } from '@shopify/polaris'
import { Toast } from '@shopify/app-bridge-react'
import { useAppQuery, useAuthenticatedFetch } from '../hooks'
import { useNavigate } from 'react-router-dom'
import PopulateApi from '../apis/populate'

export function ProductsCard(props) {
  const { actions } = props

  const navigate = useNavigate()

  const emptyToastProps = { content: null }
  const [isLoading, setIsLoading] = useState(true)
  const [toastProps, setToastProps] = useState(emptyToastProps)
  const fetch = useAuthenticatedFetch()

  const {
    data,
    refetch: refetchProductCount,
    isLoading: isLoadingCount,
    isRefetching: isRefetchingCount,
  } = useAppQuery({
    url: '/api/products/count',
    reactQueryOptions: {
      onSuccess: () => {
        setIsLoading(false)
      },
    },
  })

  const toastMarkup = toastProps.content && !isRefetchingCount && (
    <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
  )

  // const handlePopulate = async () => {
  //   setIsLoading(true)
  //   const response = await fetch('/api/products/create')

  //   if (response.ok) {
  //     await refetchProductCount()
  //     setToastProps({ content: '5 products created!' })
  //   } else {
  //     setIsLoading(false)
  //     setToastProps({
  //       content: 'There was an error creating products',
  //       error: true,
  //     })
  //   }
  // }

  const handlePopulate = async () => {
    try {
      actions.showAppLoading()

      let res = await PopulateApi.create()
      if (!res.success) {
        throw res.error
      }

      actions.showNotify({ message: 'Process is running in background. Waiting for finnish!' })

      navigate('/history-actions')
    } catch (error) {
      console.log(error)
      actions.showNotify({ message: error.message, error: true })
    } finally {
      actions.hideAppLoading()
    }
  }

  return (
    <>
      {toastMarkup}
      <Card
        title="Product Counter"
        sectioned
        // primaryFooterAction={{
        //   content: 'Populate 5 products',
        //   onAction: handlePopulate,
        //   loading: isLoading,
        // }}
        primaryFooterAction={{
          content: 'Populate 20 products',
          onAction: handlePopulate,
          loading: isLoading,
        }}
        // primaryFooterAction={{
        //   content: 'Products page',
        //   onAction: () => navigate('/products'),
        //   loading: isLoading,
        // }}
      >
        <TextContainer spacing="loose">
          <p>
            Sample products are created with a default title and price. You can remove them at any
            time.
          </p>
          <Heading element="h4">
            TOTAL PRODUCTS
            <DisplayText size="medium">
              <TextStyle variation="strong">{isLoadingCount ? '-' : data.data.count}</TextStyle>
            </DisplayText>
          </Heading>
        </TextContainer>
      </Card>
    </>
  )
}
