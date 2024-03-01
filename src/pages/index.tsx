import dayjs from "dayjs";
import { type NextPage } from "next";

import { SignInButton, useUser } from "@clerk/nextjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { api, type RouterOutputs } from "~/utils/api";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();

  const [input, setInput] = useState("");

  const ctx = api.useUtils();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      // returns a promise, we don't care because this is a side effect
      void ctx.posts.getAll.invalidate();
    },
    onError: (err) => {
      const errorMessage = err.data?.zodError?.fieldErrors.content;
      toast.error(
        errorMessage?.[0]
          ? errorMessage[0]
          : "Failed to create post. Please try again.",
      );
    },
  });

  if (!user) return null;

  return (
    <div className="flex w-full gap-3">
      <Image
        src={user.imageUrl}
        alt={user.fullName ?? "Profile picture"}
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
      <input
        placeholder="Type some emojis!"
        className="grow bg-transparent outline-none"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") mutate({ content: input });
          }
        }}
        disabled={isPosting}
      />
      {input !== "" && !isPosting && (
        <button onClick={() => mutate({ content: input })} disabled={isPosting}>
          Post
        </button>
      )}

      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="flex gap-3 border-b border-slate-400 p-4">
      <Image
        src={author.imageUrl}
        alt={`${author.username}'s profile picture`}
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex gap-1 text-slate-300">
          <span>{`@${author.username}`}</span>
          <span className="font-thin">{`· ${dayjs(post.createdAt).fromNow()}`}</span>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // start fetching ASAP
  api.posts.getAll.useQuery();

  // return empty div if user isn't loaded yet
  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Chirp</title>
        <meta name="description" content="Emoji social media platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
          <div className="flex border-b border-slate-400 p-4">
            {!isSignedIn && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            )}
            {isSignedIn && <CreatePostWizard />}
          </div>

          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;
