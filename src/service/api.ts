import { db } from "@/lib/firebase";
import { CommentType, GossipType, ReactionType, UserType } from "@/types/types";
import axios from "axios";
import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

const BASE_URL = "https://newsdata.io/api/1/latest";
const API_KEYS = process.env.NEXT_PUBLIC_NEWS_API_KEYS
  ? process.env.NEXT_PUBLIC_NEWS_API_KEYS.split(",").map((key) => key.trim())
  : [];
let currentApiKeyIndex = 0;

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

export const fetchGossips = async (
  location: string,
  user: UserType,
  keyword: string,
  nextPage?: string
): Promise<{ articles: GossipType[]; nextPage: string | null }> => {
  try {
    if (API_KEYS.length === 0) {
      console.error("No API keys available.");
      return { articles: [], nextPage: null };
    }
    let countryFilter = "";
    if (location !== "worldwide")
      countryFilter = `&country=${user.location.country.toLowerCase()}`;

    const getGossipQuery = (keyword: string) => {
      switch (keyword.toLowerCase()) {
        case "corporate":
          return encodeURIComponent(
            "corporate OR workplace OR office OR layoffs OR HR"
          );
        case "entertainment":
          return encodeURIComponent(
            "celebrity OR movie OR Hollywood OR Bollywood OR music OR influencer"
          );
        case "politics":
          return encodeURIComponent(
            "political OR government OR election OR corruption OR media OR protest"
          );
        case "tech":
          return encodeURIComponent(
            "startup OR tech OR AI OR crypto OR CEO OR silicon"
          );
        case "college":
          return encodeURIComponent(
            "university OR college OR professor OR student OR campus OR exam"
          );
        default:
          return encodeURIComponent("gossip OR rumor OR controversy OR leaked");
      }
    };

    const gossipQuery = getGossipQuery(keyword);
    console.log("Gossip Query:", gossipQuery);
    console.log("countryFilter:", countryFilter);

    const fetchNews = async (attempt = 0): Promise<any> => {
      if (attempt >= API_KEYS.length) {
        console.error("All API keys are exhausted.");
        return { articles: [], nextPage: null };
      }

      const apiKey = API_KEYS[currentApiKeyIndex];
      const url = `${BASE_URL}?apikey=${apiKey}&qInTitle=${gossipQuery}${
        nextPage ? `&page=${nextPage}` : ""
      }&removeduplicate=1&image=1&language=en${countryFilter}`;
      try {
        const response = await axios.get(url, { timeout: 5000 });

        if (!response.data.results) return { articles: [], nextPage: null };

        const articles = response.data.results.map((news: any) => ({
          id: `news-${news.article_id}-${Date.now()}`,
          title: news.title,
          content: news.description || "No description available.",
          isSensitive: false,
          visibility: "public",
          imageUrl: news.image_url || "",
          createdAt: new Date(news.pubDate),
          expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          paymentId: "",
          userId: news.source_name || "newsdata",
          username: news.source_url || "Anonymous News",
          location: {
            city: "",
            state: "",
            country: news.country || "Unknown",
          },
          reactions: { "😂": [], "🔥": [], "💀": [], "💦": [] },
          comments: [],
          isWhispr: false,
        }));
        return { articles, nextPage: response.data.nextPage || null };
      } catch (error: any) {
        if (error.response?.status === 429) {
          console.warn(
            `API Key ${apiKey} hit rate limit. Switching to next key...`
          );
          currentApiKeyIndex = (currentApiKeyIndex + 1) % API_KEYS.length;
          return fetchNews(attempt + 1);
        }
        console.error("Error fetching gossips:", error);
        return { articles: [], nextPage: null };
      }
    };
    return await fetchNews();
  } catch (error) {
    console.error("Error fetching gossips:", error);
    return { articles: [], nextPage: null };
  }
};

//FireStore Query Logic
// export const fetchGossipsFromFirestore = (
//   location: string,
//   user: UserType,
//   keyword: string,
//   setStories: (stories: GossipType[]) => void
// ) => {
//   if (!user) return;

//   try {
//     const baseQuery = collection(db, "gossips");
//     const currentTime = Timestamp.now();

//     let q = query(
//       baseQuery,
//       where("expireAt", ">", currentTime),
//       orderBy("expireAt", "desc")
//     );

//     if (location !== "worldwide") {
//       const field =
//         location === "local" || location === "city"
//           ? "location.city"
//           : location === "state"
//           ? "location.state"
//           : "location.country";

//       const locationField = field.split(".")[1] as keyof typeof user.location;
//       const locationValue = user?.location[locationField];
//       if (locationValue) {
//         q = query(q, where(field, "==", locationValue));
//       }
//     }
//     if (keyword && keyword !== "trending news") {
//       q = query(q, where("keyword", "==", keyword.toLowerCase()));
//     }

//     const expiredQuery = query(baseQuery, where("expireAt", "<=", currentTime));

//     const cleanupExpired = async () => {
//       const expiredDocs = await getDocs(expiredQuery);
//       const batch = writeBatch(db);

//       expiredDocs.forEach((doc) => {
//         const updateData = {
//           content: deleteField(),
//           isSensitive: deleteField(),
//           visibility: deleteField(),
//           imageUrl: deleteField(),
//           // reactions: deleteField(),
//           // comments: deleteField(),
//           location: deleteField(),
//           paymentId: deleteField(),
//           username: deleteField(),
//           userId: deleteField(),
//           keyword: deleteField(),
//           isWhispr: deleteField(),
//         };
//         batch.update(doc.ref, updateData);
//       });

//       if (!expiredDocs.empty) {
//         await batch.commit();
//         console.log(`Cleaned up ${expiredDocs.size} expired gossips`);
//       }
//     };

//     cleanupExpired();

//     const cleanupInterval = setInterval(cleanupExpired, 5 * 60 * 1000);

//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const gossipData = snapshot.docs.map((doc) => {
//         const data = doc.data();
//         return {
//           id: doc.id,
//           expireAt: data.expireAt.toDate(),
//           createdAt: data.createdAt.toDate(),
//           title: data.title,
//           content: data.content,
//           isSensitive: data.isSensitive,
//           visibility: data.visibility,
//           imageUrl: data.imageUrl,
//           reactions: data.reactions,
//           comments: data.comments,
//           location: data.location,
//           paymentId: data.paymentId,
//           username: data.username,
//           userId: data.userId,
//           keyword: data.keyword,
//           isWhispr: data.isWhispr,
//         };
//       });

//       setStories(gossipData);
//     });
//     return () => {
//       unsubscribe();
//       clearInterval(cleanupInterval);
//     };
//   } catch (error) {
//     console.error("Error fetching gossips:", error);
//   }
// };

export const fetchGossipsFromFirestore = async (
  location: string,
  user: UserType,
  keyword: string,
  setStories: (stories: GossipType[]) => void
) => {
  if (!user) return;

  try {
    const baseQuery = collection(db, "gossips");
    const snapshot = await getDocs(baseQuery);

    let gossipData = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        expireAt: data.expireAt.toDate(),
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
        keyword: data.keyword,
        isWhispr: data.isWhispr,
      };
    });

    const batch = writeBatch(db);
    gossipData.forEach((gossip) => {
      if (gossip.expireAt <= new Date()) {
        const docRef = doc(db, "gossips", gossip.id);
        batch.update(docRef, {
          content: deleteField(),
          isSensitive: deleteField(),
          visibility: deleteField(),
          imageUrl: deleteField(),
          location: deleteField(),
          paymentId: deleteField(),
          username: deleteField(),
          userId: deleteField(),
          keyword: deleteField(),
          isWhispr: deleteField(),
        });
      }
    });

    await batch.commit();
    gossipData = gossipData.filter((gossip) => gossip.expireAt > new Date());
    gossipData = gossipData.filter((gossip) => {
      const matchesLocation =
        location === "worldwide" ||
        (gossip.location &&
          ((location === "city" &&
            gossip.location.city === user.location.city) ||
            (location === "state" &&
              gossip.location.state === user.location.state) ||
            (location === "country" &&
              gossip.location.country === user.location.country)));

      const matchesKeyword =
        keyword === "trending news" ||
        gossip.keyword?.toLowerCase() === keyword.toLowerCase();

      return matchesLocation && matchesKeyword;
    });

    setStories(gossipData);
  } catch (error) {
    console.error("Error fetching and cleaning gossips:", error);
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
      reactions: { "😂": [], "🔥": [], "💀": [], "💦": [] },
      comments: [],
      keyword: gossipDetails.keyword,
      isWhispr: true,
    };

    const gossipRef = await addDoc(collection(db, "gossips"), gossipData);

    await setDoc(doc(db, "users", user.ip), {
      ...user,
      gossips: [...(user.gossips || []), gossipRef.id],
    });
    const userRef = doc(db, "users", user.ip);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const updatedCredit = (userSnap.data().credit || 0) + 5;
      await updateDoc(userRef, { credit: updatedCredit });
    }

    return gossipRef.id;
  } catch (error) {
    console.error("Error posting gossip:", error);
    throw error;
  }
};

export const updateGossipReaction = async (
  reaction: "😂" | "🔥" | "💀" | "💦",
  gossip: GossipType,
  user: UserType,
  setReactions: (reactions: ReactionType) => void
) => {
  if (!user) throw new Error("User is not initialized");

  try {
    const gossipRef = doc(db, "gossips", gossip.id);
    let gossipSnapshot = await getDoc(gossipRef);

    if (!gossipSnapshot.exists()) {
      const expireAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const gossipData = {
        title: gossip.title,
        content: gossip.content,
        isSensitive: gossip.isSensitive,
        visibility: gossip.visibility,
        imageUrl: gossip.imageUrl,
        createdAt: new Date(),
        expireAt,
        userId: gossip.userId,
        username: gossip.username,
        location: gossip.location,
        reactions: { "😂": [], "🔥": [], "💀": [], "💦": [] },
        comments: [],
        keyword: "trending news",
        isWhispr: false,
      };

      await setDoc(gossipRef, gossipData);
      gossipSnapshot = await getDoc(gossipRef);
    }

    const gossipData = gossipSnapshot.data();
    const updatedReactions = { ...gossipData?.reactions };

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
      // const authorRef = doc(db, "users", gossipData?.userId);
      // const authorSnapshot = await getDoc(authorRef);
      // if (authorSnapshot.exists()) {
      //   const authorData = authorSnapshot.data();
      //   await updateDoc(authorRef, { credit: authorData.credit + 1 });
      // }
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
  gossip: GossipType,
  user: UserType,
  newComment: string,
  setComments: (comments: CommentType[]) => void,
  setNewComment: (comment: string) => void
) => {
  if (!user || !newComment.trim()) return;

  try {
    const gossipRef = doc(db, "gossips", gossip.id);
    let gossipSnapshot = await getDoc(gossipRef);

    if (!gossipSnapshot.exists()) {
      const expireAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const gossipData = {
        title: gossip.title,
        content: gossip.content,
        isSensitive: gossip.isSensitive,
        visibility: gossip.visibility,
        imageUrl: gossip.imageUrl,
        createdAt: new Date(),
        expireAt,
        userId: gossip.userId,
        username: gossip.username,
        location: gossip.location,
        reactions: { "😂": [], "🔥": [], "💀": [], "💦": [] },
        comments: [],
        keyword: "trending news",
        isWhispr: false,
      };

      await setDoc(gossipRef, gossipData);
      gossipSnapshot = await getDoc(gossipRef);
    }

    const gossipData = gossipSnapshot.data();
    const hasCommented = gossipData?.comments.some(
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

    const updatedComments = [...gossipData?.comments, newCommentData];
    await updateDoc(gossipRef, { comments: updatedComments });

    // const authorRef = doc(db, "users", gossipData?.userId);
    // const authorSnapshot = await getDoc(authorRef);
    // if (authorSnapshot.exists()) {
    //   const authorData = authorSnapshot.data();
    //   await updateDoc(authorRef, { credit: authorData.credit + 5 });
    // }

    const commenterRef = doc(db, "users", user.ip);
    const commenterSnapshot = await getDoc(commenterRef);
    if (commenterSnapshot.exists()) {
      const commenterData = commenterSnapshot.data();
      await updateDoc(commenterRef, { credit: commenterData.credit + 0.5 });
    }

    setComments(updatedComments);
    setNewComment("");
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

export const reportGossip = async (gossipId: string, reporterIp: string) => {
  const gossipRef = doc(db, "gossips", gossipId);
  const gossipSnap = await getDoc(gossipRef);

  if (gossipSnap.exists()) {
    const gossipData = gossipSnap.data();
    const reports = (gossipData.reports || []) as string[];
    const posterIp = gossipData.userId;

    if (reports.includes(reporterIp)) {
      console.warn("You've already reported this gossip.");
      alert("You've already reported this gossip.");
      return {
        success: false,
        message: "You've already reported this gossip.",
      };
    }

    reports.push(reporterIp);
    await updateDoc(gossipRef, { reports });

    if (reports.length > 200000) {
      await deleteDoc(gossipRef);
      await setDoc(doc(db, "blockedIps", posterIp), {
        userId: posterIp,
        blockedAt: new Date(),
      });
      return { success: true, message: "Gossip removed and user blocked." };
    }
    return { success: true, message: "Report submitted successfully." };
  }
  return { success: false, message: "Gossip not found." };
};

export const isIpBlocked = async (ip: string) => {
  const blockedIpRef = doc(db, "blockedIps", ip);
  const blockedIpSnap = await getDoc(blockedIpRef);
  return blockedIpSnap.exists();
};
