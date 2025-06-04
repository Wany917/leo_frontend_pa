import Messages from '@/components/messages/Messages'

export default function MessagesPage() {
  return (
    <Messages
      userType="client"
      apiBaseUrl={process.env.NEXT_PUBLIC_API_URL}
      navigationLinks={[
        { href: '/app_client/announcements', label: 'navigation.myAnnouncements' },
        { href: '/app_client/payments', label: 'navigation.myPayments' },
        { href: '/app_client/messages', label: 'navigation.messages', active: true },
        { href: '/app_client/complaint', label: 'navigation.makeComplaint' },
      ]}
      editAccountUrl="/app_client/edit-account"
      registerLinks={[
        { href: '/register/delivery-man', label: 'common.deliveryMan' },
        { href: '/register/shopkeeper', label: 'common.shopkeeper' },
        { href: '/register/service-provider', label: 'common.serviceProvider' },
      ]}
    />
  )
}