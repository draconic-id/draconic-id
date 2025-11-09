
import FooterController from "@/components/footer/footer-controller"
import { Spinner } from "@/components/ui/spinner"
import Image from "next/image"

export default function Loading() {
    return (
        <div className="w-full h-svh flex flex-col justify-center items-center gap-8">
            <Image src="/logo.svg" alt="Logo" width={128} height={128}/>
            <Spinner/>
            <FooterController visible={false}/>
        </div>
    )
  }