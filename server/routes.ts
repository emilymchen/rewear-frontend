import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Authing, Cataloging, Donating, Favoriting, Friending, Labeling, Messaging, Posting, Sessioning } from "./app";
import { DonationStatus } from "./concepts/donating";
import { SessionDoc } from "./concepts/sessioning";
import Responses from "./responses";

import { z } from "zod";
import { CATEGORIES } from "./concepts/cataloging";

/**
 * Web server routes for the app. Implements synchronizations between concepts.
 */
class Routes {
  // Synchronize the concepts from `app.ts`.

  @Router.get("/session")
  async getSessionUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await Authing.getUsers();
  }

  @Router.get("/userById/:id")
  async getUserById(id: string) {
    return await Authing.getUserById(new ObjectId(id));
  }

  @Router.get("/users/:username")
  @Router.validate(z.object({ username: z.string().min(1) }))
  async getUser(username: string) {
    return await Authing.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: SessionDoc, username: string, password: string) {
    Sessioning.isLoggedOut(session);
    return await Authing.create(username, password);
  }

  @Router.patch("/users/username")
  async updateUsername(session: SessionDoc, username: string) {
    const user = Sessioning.getUser(session);
    return await Authing.updateUsername(user, username);
  }

  @Router.patch("/users/password")
  async updatePassword(session: SessionDoc, currentPassword: string, newPassword: string) {
    const user = Sessioning.getUser(session);
    return Authing.updatePassword(user, currentPassword, newPassword);
  }

  @Router.delete("/users")
  async deleteUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    Sessioning.end(session);
    return await Authing.delete(user);
  }

  @Router.post("/login")
  async logIn(session: SessionDoc, username: string, password: string) {
    const u = await Authing.authenticate(username, password);
    Sessioning.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: SessionDoc) {
    Sessioning.end(session);
    return { msg: "Logged out!" };
  }

  @Router.get("/posts")
  @Router.validate(z.object({ author: z.string().optional() }))
  async getPosts(author?: string, session?: SessionDoc) {
    let posts;
    if (author) {
      const id = (await Authing.getUserByUsername(author))._id;
      posts = await Posting.getByAuthor(id);
    } else {
      posts = await Posting.getPosts();
    }

    if (session) {
      const userId = Sessioning.getUser(session);
      const postsWithFavoriteStatus = [];
      for (const post of posts) {
        const isFavorited = await Favoriting.isFavorited(userId, post._id);
        postsWithFavoriteStatus.push({
          ...post,
          favorited: isFavorited,
        });
      }
      return Responses.posts(postsWithFavoriteStatus);
    } else {
      return Responses.posts(posts);
    }
  }

  @Router.get("/posts/:id")
  async getPost(id: string) {
    const oid = new ObjectId(id);
    return await Responses.post(await Posting.getPost(oid));
  }

  @Router.post("/posts")
  async createPost(session: SessionDoc, caption: string, selectedItems: string[], photoUrl?: string, options?: PostOptions) {
    const user = Sessioning.getUser(session);
    const created = await Posting.create(user, caption, selectedItems, photoUrl, options);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:id")
  async updatePost(session: SessionDoc, id: string, content?: string, options?: PostOptions) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Posting.assertAuthorIsUser(oid, user);
    return await Posting.update(oid, content, options);
  }

  @Router.delete("/posts/:id")
  async deletePost(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Posting.assertAuthorIsUser(oid, user);
    return Posting.delete(oid);
  }

  @Router.get("/friends")
  async getFriends(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.idsToUsernames(await Friending.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: SessionDoc, friend: string) {
    const user = Sessioning.getUser(session);
    const friendOid = (await Authing.getUserByUsername(friend))._id;
    return await Friending.removeFriend(user, friendOid);
  }

  @Router.get("/friend/requests")
  async getRequests(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Responses.friendRequests(await Friending.getRequests(user));
  }

  @Router.post("/friend/requests/:to")
  async sendFriendRequest(session: SessionDoc, to: string) {
    const user = Sessioning.getUser(session);
    const toOid = (await Authing.getUserByUsername(to))._id;
    return await Friending.sendRequest(user, toOid);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: SessionDoc, to: string) {
    const user = Sessioning.getUser(session);
    const toOid = (await Authing.getUserByUsername(to))._id;
    return await Friending.removeRequest(user, toOid);
  }

  @Router.put("/friend/accept/:from")
  async acceptFriendRequest(session: SessionDoc, from: string) {
    const user = Sessioning.getUser(session);
    const fromOid = (await Authing.getUserByUsername(from))._id;
    return await Friending.acceptRequest(fromOid, user);
  }

  @Router.put("/friend/reject/:from")
  async rejectFriendRequest(session: SessionDoc, from: string) {
    const user = Sessioning.getUser(session);
    const fromOid = (await Authing.getUserByUsername(from))._id;
    return await Friending.rejectRequest(fromOid, user);
  }

  // Get a user's catalog (closet)
  @Router.get("/catalog")
  async getCatalog(session: SessionDoc, category?: (typeof CATEGORIES)[number]) {
    const user = Sessioning.getUser(session);

    // Fetch all catalog items for the user based on category
    const catalogItems = await Cataloging.getCatalog(user, category);

    // Fetch donation statuses for these items
    return catalogItems.filter(async (item) => {
      const donationStatus = await Donating.getDonationStatus(item._id);
      return !donationStatus || donationStatus === DonationStatus.NotListed;
    });
  }

  @Router.get("/catalog/:itemId")
  async getCatalogItem(session: SessionDoc, itemId: string) {
    const user = Sessioning.getUser(session);
    const item = new ObjectId(itemId);
    return await Cataloging.getItem(user, item);
  }

  // Add an item to the user's catalog
  @Router.post("/catalog")
  // @Router.validate(addItemSchema) // Use Zod validation
  async addItemToCatalog(session: SessionDoc, name: string, category: (typeof CATEGORIES)[number], photoUrl: string) {
    // const upload = multer({
    //   storage: storage,
    //   fileFilter: (req, file, cb) => {
    //     if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
    //       cb(null, true);
    //     } else {
    //       cb(null, false);
    //       return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    //     }
    //   },
    // });

    // const uploadImages = upload.array("image");

    const user = Sessioning.getUser(session);
    return await Cataloging.addToCatalog(user, name, category, photoUrl);
  }

  // Remove an item from the user's catalog
  @Router.delete("/catalog/:itemId")
  async removeItemFromCatalog(session: SessionDoc, itemId: string) {
    const user = Sessioning.getUser(session);
    const item = new ObjectId(itemId);
    return await Cataloging.removeFromCatalog(user, item);
  }

  // Get all labels for an item
  @Router.get("/catalog/:itemId/labels")
  async getLabels(session: SessionDoc, itemId: string) {
    const user = Sessioning.getUser(session);
    const item = new ObjectId(itemId);
    return await Labeling.getLabels(item);
  }

  // Add a label to an item
  @Router.post("/catalog/:itemId/labels")
  async addLabelToItem(session: SessionDoc, itemId: string, label: string) {
    const user = Sessioning.getUser(session);
    const item = new ObjectId(itemId);
    return await Labeling.addLabel(item, label);
  }

  // Remove a label from an item
  @Router.delete("/catalog/:itemId/labels/:label")
  async removeLabelFromItem(session: SessionDoc, itemId: string, label: string) {
    const user = Sessioning.getUser(session);
    const item = new ObjectId(itemId);
    return await Labeling.removeLabel(item, label);
  }

  // Get all favorited items/posts for the user
  @Router.get("/favorites")
  async getFavoritedItems(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Favoriting.getFavoritedItems(user);
  }

  // Favorite an item or post
  @Router.post("/favorites/:itemId")
  async favoriteItem(session: SessionDoc, itemId: string) {
    const user = Sessioning.getUser(session);
    const item = new ObjectId(itemId);
    return await Favoriting.favoriteItem(user, item);
  }

  // Unfavorite an item or post
  @Router.delete("/favorites/:itemId")
  async unfavoriteItem(session: SessionDoc, itemId: string) {
    const user = Sessioning.getUser(session);
    const item = new ObjectId(itemId);
    return await Favoriting.unfavoriteItem(user, item);
  }

  // Delete favorites for all users for an item or post
  @Router.delete("/favorites/:itemId/all")
  async deleteAllFavorites(session: SessionDoc, itemId: string) {
    const item = new ObjectId(itemId);
    return await Favoriting.deleteAllFavoritesForItem(item);
  }

  // Get all messages for the user
  @Router.get("/messages")
  async getMessages(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Messaging.getMessages(user);
  }

  @Router.get("/conversations")
  async getConversations(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Messaging.getConversationUsers(user);
  }

  // Send a message to another user
  @Router.post("/messages")
  async sendMessage(session: SessionDoc, recipient: string, content: string) {
    const sender = Sessioning.getUser(session);
    // const recipientId = (await Authing.getUserByUsername(recipient))._id;
    const recipientId = new ObjectId(recipient);
    return await Messaging.sendMessage(sender, recipientId, content);
  }

  // Get messages between the user and another user
  @Router.get("/messages/:recipient")
  async getMessagesWithRecipient(session: SessionDoc, recipient: string) {
    const user = Sessioning.getUser(session);
    const recipientId = new ObjectId(recipient);
    return await Messaging.getMessagesBetween(user, recipientId);
  }

  // List an item for donation
  @Router.post("/donations/:itemId")
  async listForDonation(session: SessionDoc, itemId: string) {
    const user = Sessioning.getUser(session);
    const itemObjectId = new ObjectId(itemId);
    const result = await Donating.listForDonation(user, itemObjectId);
    return result;
  }

  // Get all donation items for a user
  @Router.get("/donations")
  async getUserDonations(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const donations = await Donating.getUserListedItems(user);
    return donations;
  }

  // Get all listed donation items
  @Router.get("/donations/all")
  async getAllDonations() {
    return await Donating.getAllListedItems();
  }

  // Get all previously donated items for a user
  @Router.get("/donated")
  async getDonatedItems(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Donating.getDonatedItems(user);
  }

  // Unlist a donation item
  @Router.delete("/donations/:itemId")
  async unlistDonationItem(session: SessionDoc, itemId: string) {
    const user = Sessioning.getUser(session);
    const itemObjectId = new ObjectId(itemId);
    await Donating.unlistForDonation(user, itemObjectId);
    return { msg: "Item removed from donation list" };
  }

  // Delete an item from the donation list
  @Router.delete("/donations/:itemId/delete")
  async deleteFromDonationList(session: SessionDoc, itemId: string) {
    const user = Sessioning.getUser(session);
    const itemObjectId = new ObjectId(itemId);
    await Donating.deleteFromDonationList(user, itemObjectId);
    return { msg: "Item removed from donation list" };
  }

  // Update the status of an item in the donation list
  @Router.patch("/donations/:itemId/status")
  async markAsDonated(session: SessionDoc, itemId: string) {
    const user = Sessioning.getUser(session);
    const itemObjectId = new ObjectId(itemId);
    await Donating.markAsDonated(user, itemObjectId);
    return { msg: "Donation status updated!" };
  }

  // Get status of a specific item (unlisted, listed, donated)
  @Router.get("/donations/:itemId")
  async getDonationStatus(session: SessionDoc, itemId: string) {
    const user = Sessioning.getUser(session);
    const itemObjectId = new ObjectId(itemId);
    const donationStatus = await Donating.getDonationStatus(itemObjectId);
    return donationStatus;
  }
}

/** The web app. */
export const app = new Routes();

/** The Express router. */
export const appRouter = getExpressRouter(app);
