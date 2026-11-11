"use client"

import { useParams } from "next/navigation"
import ProductForm from "../../../../../components/admin/ProductForm"

export default function EditProduct() {
  const params = useParams()
  const slug = params.slug as string

  return <ProductForm mode="edit" slug={slug} />
}
