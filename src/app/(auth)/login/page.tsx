"use client";

import Button from "@/components/ui/Button";
import { FC, useState } from "react";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import Image from "next/image";
import { Icons } from "@/components/Icons";

interface pageProps {}

const Login: FC<pageProps> = ({}) => {
  const [isLoading, setLoading] = useState({
    google: false,
    facebook: false,
  });

  async function loginWithGoogle() {
    setLoading({ ...isLoading, google: true });
    try {
      await signIn("google");
    } catch (error) {
      toast.error("Something went wrong with login");
      console.error(error);
    } finally {
      setLoading({ ...isLoading, google: false });
    }
  }

  async function loginWithFacebook() {
    setLoading({ ...isLoading, facebook: true });
    try {
      await signIn("facebook");
    } catch (error) {
      toast.error("Something went wrong with login");
      console.error(error);
    } finally {
      setLoading({ ...isLoading, facebook: false });
    }
  }

  return (
    <>
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full flex flex-col items-center max-w-md space-y-8">
          <div className="flex flex-col items-center gap-8">
            <Image height={100} width={100} alt="logo" src={"/logo.png"} className="w-24 md:w-40 " />
            <h2 className="mt-6 text-center text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
              Sign in to your account
            </h2>
          </div>

          <Button
            variant="default"
            size="default"
            isLoading={isLoading.google}
            type="button"
            className="max-w-sm mx-auto w-full"
            onClick={loginWithGoogle}
          >
            {" "}
            {!isLoading.google && <Icons.LogoGoogle className="mr-2 h-4 w-4" />}
            Google
          </Button>

          <Button
            variant="default"
            size="default"
            isLoading={isLoading.facebook}
            type="button"
            className="max-w-sm mx-auto w-full bg-[#3b5998]"
            onClick={loginWithFacebook}
          >
            {!isLoading.facebook && <Icons.LogoFacebook className="mr-2 h-4 w-4" />}
            Facebook
          </Button>
        </div>
      </div>
    </>
  );
};

export default Login;
