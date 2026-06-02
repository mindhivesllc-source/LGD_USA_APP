import { json, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { getShopifyAdminAppUrl, isIframeRequest } from "../../shopify-admin-url.server"
import styles from "./styles.module.css"

export const loader = async ({ request }) => {
  const url = new URL(request.url)

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`)
  }

  const adminAppUrl = getShopifyAdminAppUrl(request)

  if (!isIframeRequest(request)) {
    throw redirect(adminAppUrl)
  }

  return json({ adminAppUrl })
}

export default function App() {
  const { adminAppUrl } = useLoaderData()

  return (
    <div className={styles.index} lang="en">
      <div className={styles.content}>
        <h1 className={styles.heading}>LGD Jewelry Sync</h1>
        <p className={styles.text}>
          Open this app from Shopify Admin.
        </p>
        <a className={styles.button} href={adminAppUrl} target="_top">
          Open app
        </a>
      </div>
    </div>
  )
}
