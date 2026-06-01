import { redirect } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
import { login } from "../../shopify.server"
import styles from "./styles.module.css"

export const loader = async ({ request }) => {
  const url = new URL(request.url)

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`)
  }

  return { showForm: Boolean(login) }
}

export default function App() {
  const { showForm } = useLoaderData()

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>LGD Jewelry Sync</h1>
        <p className={styles.text}>
          Automatically sync LGD supplier jewelry inventory to your Shopify store
        </p>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Shop domain</span>
              <input className={styles.input} type="text" name="shop" />
              <span>e.g: my-shop-domain.myshopify.com</span>
            </label>
            <button className={styles.button} type="submit">
              Log in
            </button>
          </Form>
        )}
        <ul className={styles.list}>
          <li>
            <strong>Automated sync</strong>. Pull your entire LGD catalog every 6 hours. New products appear automatically.
          </li>
          <li>
            <strong>Smart categories</strong>. Products are classified into Rings, Bracelets, Necklaces, Earrings, Pendants and more.
          </li>
          <li>
            <strong>Video support on any plan</strong>. Product videos open as external links — works on Shopify Basic.
          </li>
        </ul>
      </div>
    </div>
  )
}
