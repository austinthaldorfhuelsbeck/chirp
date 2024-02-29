import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import { api } from "~/utils/api";

export default function Home() {
  const { data } = api.posts.getAll.useQuery();

  const user = useUser();

  return (
    <>
      <Head>
        <title>Chirp</title>
        <meta name="description" content="Emoji social media platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div>
          {!user.isSignedIn && <SignInButton />}
          {!!user.isSignedIn && <SignOutButton />}
        </div>
        <div>
          {data?.map((post) => <div key={post.id}>{post.content}</div>)}
        </div>
      </main>
    </>
  );
}
