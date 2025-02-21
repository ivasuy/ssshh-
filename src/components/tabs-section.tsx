// "use client";

// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { GossipCard } from "@/components/gossip/gossip-card";
// import { useState, useEffect } from "react";
// import {
//   collection,
//   query,
//   orderBy,
//   onSnapshot,
//   where,
// } from "firebase/firestore";
// import { db } from "@/lib/firebase";

// interface TabsSectionProps {
//   location: string;
//   user: any;
// }

// export function TabsSection({ location, user }: TabsSectionProps) {
//   const [stories, setStories] = useState<any[]>([]);

//   useEffect(() => {
//     const fetchGossips = async () => {
//       try {
//         let q = query(collection(db, "gossips"), orderBy("createdAt", "desc"));

//         if (location !== "worldwide" && user) {
//           const field =
//             location === "local" || location === "city"
//               ? "location.city"
//               : location === "state"
//               ? "location.state"
//               : "location.country";

//           q = query(q, where(field, "==", user?.location[field.split(".")[1]]));
//         }

//         const unsubscribe = onSnapshot(q, (snapshot) => {
//           const currentTime = new Date();
//           const gossipData = snapshot.docs
//             .map((doc) => {
//               const data = doc.data();
//               return {
//                 id: doc.id,
//                 expireAt: data.expireAt,
//                 ...data,
//               };
//             })
//             .filter((gossip) => new Date(gossip.expireAt) > currentTime);

//           setStories(gossipData);
//         });

//         return () => unsubscribe();
//       } catch (error) {
//         console.error("Error fetching gossips:", error);
//       }
//     };

//     if (user) fetchGossips();
//   }, [location, user]);

//   return (
//     <div className="container mx-auto px-4 py-4 sm:py-8">
//       <Tabs defaultValue="daily" className="w-full">
//         <TabsList className="flex w-full max-w-[600px] mx-auto mb-4 sm:mb-8">
//           <TabsTrigger value="daily">Daily</TabsTrigger>
//           {/* Future Implementation */}
//           {/* <TabsTrigger value="exclusive">Exclusive</TabsTrigger> */}
//           {/* <TabsTrigger value="chatrooms">Chats</TabsTrigger> */}
//         </TabsList>

//         <TabsContent value="daily">
//           <ScrollArea className="h-[calc(100vh-240px)] sm:h-[calc(100vh-200px)]">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
//               {stories.map((story) => (
//                 <GossipCard key={story.id} gossip={story} />
//               ))}
//             </div>
//           </ScrollArea>
//         </TabsContent>

//         {/* Future Implementation */}
//         {/* <TabsContent value="exclusive">
//           <div className="text-center px-4">
//             <h3 className="text-xl sm:text-2xl font-bold mb-4">Unlock Exclusive Stories</h3>
//             <p className="text-muted-foreground mb-6">
//               Get access to our most impactful and inspiring stories
//             </p>
//             <Button>Unlock for ₹199</Button>
//           </div>
//         </TabsContent> */}

//         {/* <TabsContent value="chatrooms">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
//             Chat room cards will be rendered here
//           </div>
//         </TabsContent> */}
//       </Tabs>
//     </div>
//   );
// }
