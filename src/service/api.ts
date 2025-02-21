import { db } from "@/lib/firebase";
import { CommentType, GossipType, ReactionType, UserType } from "@/types/types";
import axios from "axios";
import {
  addDoc,
  collection,
  deleteField,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

export const fetchUserInfo = async () => {
  try {
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const response = await axios.get("/api/getUserInfo", {
          timeout: 5000,
        });
        return response.data;
      } catch (error) {
        retries++;
        if (retries === maxRetries) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
      }
    }
  } catch (error) {
    const err = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching user info:", err);
    return null;
  }
};

export const uploadToCloudinary = async (mediaFile: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", mediaFile);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
    );
    formData.append(
      "cloud_name",
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ""
    );
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;

    console.log("Uploading to:", cloudinaryUrl);
    console.log(
      "Upload Preset:",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    );

    const response = await fetch(cloudinaryUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("Cloudinary Error Response:", errorResponse);
      throw new Error("Failed to upload media to Cloudinary");
    }

    const cloudinaryData = await response.json();
    return cloudinaryData.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
};

//FireStore Query Logic
export const fetchGossipsFromFirestore = (
  location: string,
  user: UserType,
  setStories: (stories: GossipType[]) => void
) => {
  if (!user) return;

  try {
    const baseQuery = collection(db, "gossips");
    const currentTime = new Date();

    let q = query(
      baseQuery,
      where("expireAt", ">", currentTime),
      orderBy("expireAt", "desc")
    );

    if (location !== "worldwide") {
      const field =
        location === "local" || location === "city"
          ? "location.city"
          : location === "state"
          ? "location.state"
          : "location.country";

      const locationField = field.split(".")[1] as keyof typeof user.location;
      const locationValue = user?.location[locationField];
      if (locationValue) {
        q = query(
          baseQuery,
          where(field, "==", locationValue),
          where("expireAt", ">", currentTime),
          orderBy("expireAt", "desc")
        );
      }
    }
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const gossipData = [];

      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        const expireAt = data.expireAt.toDate();
        if (expireAt <= currentTime) {
          try {
            await updateDoc(docSnapshot.ref, {
              content: deleteField(),
              isSensitive: deleteField(),
              visibility: deleteField(),
              imageUrl: deleteField(),
              reactions: deleteField(),
              comments: deleteField(),
              location: deleteField(),
              paymentId: deleteField(),
              username: deleteField(),
            });
          } catch (error) {
            console.error(
              `Failed to clear expired gossip ${docSnapshot.id}:`,
              error
            );
          }
        } else {
          gossipData.push({
            id: docSnapshot.id,
            expireAt,
            createdAt: data.createdAt.toDate(),
            title: data.title,
            content: data.content,
            isSensitive: data.isSensitive,
            visibility: data.visibility,
            imageUrl: data.imageUrl,
            reactions: data.reactions,
            comments: data.comments,
            location: data.location,
            paymentId: data.paymentId,
            username: data.username,
            userId: data.userId,
          });
        }
      }
      setStories(gossipData);
    });
    return unsubscribe;
  } catch (error) {
    console.error("Error fetching gossips:", error);
  }
};

export const postGossipWithoutPayment = async (
  gossipDetails: GossipType,
  mediaFile: File | null,
  user: UserType
) => {
  if (!user) throw new Error("User is not initialized");

  try {
    let imageUrl = "";

    if (mediaFile) imageUrl = await uploadToCloudinary(mediaFile);

    const createdAt = new Date();
    const expireAt = new Date(createdAt);
    expireAt.setHours(expireAt.getHours() + 24);

    const gossipData = {
      title: gossipDetails.title,
      content: gossipDetails.content,
      isSensitive: gossipDetails.isSensitive,
      visibility: gossipDetails.visibility,
      imageUrl,
      createdAt,
      expireAt,
      userId: user.ip,
      username: user.username,
      location: user.location,
      paymentId: "test-payment-id",
      reactions: { "😂": [], "🔥": [], "🤯": [], "💦": [] },
      comments: [],
    };

    const gossipRef = await addDoc(collection(db, "gossips"), gossipData);

    await setDoc(doc(db, "users", user.ip), {
      ...user,
      gossips: [...(user.gossips || []), gossipRef.id],
    });
    const userRef = doc(db, "users", user.ip);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const updatedCredit = (userSnap.data().credit || 0) + 50;
      await updateDoc(userRef, { credit: updatedCredit });
    }

    return gossipRef.id;
  } catch (error) {
    console.error("Error posting gossip:", error);
    throw error;
  }
};

export const updateGossipReaction = async (
  reaction: "😂" | "🔥" | "🤯" | "💦",
  gossipId: string,
  user: UserType,
  setReactions: (reactions: ReactionType) => void
) => {
  if (!user) throw new Error("User is not initialized");

  try {
    const gossipRef = doc(db, "gossips", gossipId);
    const gossipSnapshot = await getDoc(gossipRef);
    if (!gossipSnapshot.exists()) return;

    const gossipData = gossipSnapshot.data();
    const updatedReactions = { ...gossipData.reactions };

    let alreadyReacted = false;

    Object.keys(updatedReactions).forEach((key) => {
      if (updatedReactions[key].includes(user.ip)) {
        alreadyReacted = true;
        updatedReactions[key] = updatedReactions[key].filter(
          (id: string) => id !== user.ip
        );
      }
    });

    updatedReactions[reaction].push(user.ip);
    await updateDoc(gossipRef, { reactions: updatedReactions });

    if (!alreadyReacted) {
      const authorRef = doc(db, "users", gossipData.userId);
      const authorSnapshot = await getDoc(authorRef);
      if (authorSnapshot.exists()) {
        const authorData = authorSnapshot.data();
        await updateDoc(authorRef, { credit: authorData.credit + 1 });
      }

      const reactorRef = doc(db, "users", user.ip);
      const reactorSnapshot = await getDoc(reactorRef);
      if (reactorSnapshot.exists()) {
        const reactorData = reactorSnapshot.data();
        await updateDoc(reactorRef, { credit: reactorData.credit + 0.1 });
      }
    }

    setReactions(updatedReactions);
  } catch (error) {
    console.error("Error updating reaction:", error);
    throw error;
  }
};

export const addGossipComment = async (
  gossipId: string,
  user: UserType,
  newComment: string,
  setComments: (comments: CommentType[]) => void,
  setNewComment: (comment: string) => void
) => {
  if (!user || !newComment.trim()) return;

  try {
    const gossipRef = doc(db, "gossips", gossipId);
    const gossipSnapshot = await getDoc(gossipRef);
    if (!gossipSnapshot.exists()) return;

    const gossipData = gossipSnapshot.data();
    const hasCommented = gossipData.comments.some(
      (comment: CommentType) => comment.userId === user.ip
    );

    if (hasCommented) {
      alert("You can only comment once on a gossip.");
      return;
    }

    const newCommentData = {
      userId: user.ip,
      username: user.username || "Anonymous",
      comment: newComment,
      createdAt: new Date(),
    };

    const updatedComments = [...gossipData.comments, newCommentData];
    await updateDoc(gossipRef, { comments: updatedComments });

    const authorRef = doc(db, "users", gossipData.userId);
    const authorSnapshot = await getDoc(authorRef);
    if (authorSnapshot.exists()) {
      const authorData = authorSnapshot.data();
      await updateDoc(authorRef, { credit: authorData.credit + 5 });
    }

    const commenterRef = doc(db, "users", user.ip);
    const commenterSnapshot = await getDoc(commenterRef);
    if (commenterSnapshot.exists()) {
      const commenterData = commenterSnapshot.data();
      await updateDoc(commenterRef, { credit: commenterData.credit + 1.5 });
    }

    setComments(updatedComments);
    setNewComment("");
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};
