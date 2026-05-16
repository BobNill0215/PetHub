import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/error';
import { authRequired, optionalAuth } from './middleware/auth';
import { handleRegister, handleLogin, handleGetProfile, handleChangePassword } from './handler/auth';
import { handleCreatePet, handleGetUserPets, handleUpdatePet, handleDeletePet } from './handler/pet';
import { handleCreateFeed, handleGetFeeds, handleGetFeedById, handleGetRelatedFeeds, handleGetTrending, handleGetFeatured, handleGetCategories, handleDeleteFeed, handleTogglePin, handleToggleFeatured, handleUpdateFeedImages } from './handler/feed';
import { handleGetUserById, handleGetUserFeeds, handleUpdateProfile } from './handler/user';
import { handleLikeFeed, handleUnlikeFeed, handleGetLikes, handleGetComments, handleCreateComment, handleBookmarkFeed, handleUnbookmarkFeed, handleGetBookmarks, handleReportFeed, handleEditFeed, handleShareFeed } from './handler/social';
import { handleCreateProduct, handleGetProducts, handleGetProductById, handleGetMyProducts } from './handler/product';
import { handleFollow, handleUnfollow, handleGetFollowers, handleGetFollowing, handleGetFollowingFeed } from './handler/follow';
import { handleGetUserStats, handleGetPoints, handleGetNotifSettings, handleUpdateNotifSettings } from './handler/stats';
import { handleCreateConversation, handleGetConversations, handleSendMessage, handleGetMessages } from './handler/message';
import { upload, handleUpload, handleUploadMultiple } from './handler/upload';
import { handleSearch } from './handler/search';
import { handleGetNotifications, handleMarkRead, handleMarkAllRead } from './handler/notify';

(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/v1/health', (_req, res) => {
  res.json({ code: 0, message: 'ok', data: { service: 'pethub', version: '0.1.0' } });
});

// Auth
app.post('/api/v1/auth/register', handleRegister);
app.post('/api/v1/auth/login', handleLogin);
app.get('/api/v1/users/me', authRequired, handleGetProfile);
app.put('/api/v1/users/me/password', authRequired, handleChangePassword);

// Users
app.get('/api/v1/users/:id', handleGetUserById);
app.put('/api/v1/users/me/profile', authRequired, handleUpdateProfile);
app.get('/api/v1/users/:id/feeds', handleGetUserFeeds);

// Pets
app.post('/api/v1/pets', authRequired, handleCreatePet);
app.get('/api/v1/pets', authRequired, handleGetUserPets);
app.put('/api/v1/pets/:id', authRequired, handleUpdatePet);
app.delete('/api/v1/pets/:id', authRequired, handleDeletePet);

// Feeds
app.post('/api/v1/feeds', authRequired, handleCreateFeed);
app.get('/api/v1/feeds', optionalAuth, handleGetFeeds);
app.get('/api/v1/feeds/:id/related', handleGetRelatedFeeds);
app.patch('/api/v1/feeds/:id/images', authRequired, handleUpdateFeedImages);
app.get('/api/v1/categories', handleGetCategories);
app.get('/api/v1/feeds/featured', handleGetFeatured);
app.get('/api/v1/feeds/following', authRequired, handleGetFollowingFeed);
app.get('/api/v1/feeds/:id', optionalAuth, handleGetFeedById);
app.post('/api/v1/feeds/:id/pin', authRequired, handleTogglePin);
app.post('/api/v1/feeds/:id/featured', authRequired, handleToggleFeatured);
app.delete('/api/v1/feeds/:id', authRequired, handleDeleteFeed);

// Likes
app.post('/api/v1/feeds/:id/like', authRequired, handleLikeFeed);
app.delete('/api/v1/feeds/:id/like', authRequired, handleUnlikeFeed);
app.get('/api/v1/feeds/:id/likes', handleGetLikes);

// Comments
app.get('/api/v1/feeds/:id/comments', handleGetComments);
app.post('/api/v1/feeds/:id/comments', authRequired, handleCreateComment);

// Bookmarks
app.post('/api/v1/feeds/:id/bookmark', authRequired, handleBookmarkFeed);
app.delete('/api/v1/feeds/:id/bookmark', authRequired, handleUnbookmarkFeed);
app.get('/api/v1/bookmarks', authRequired, handleGetBookmarks);

// Reports
app.get('/api/v1/feeds/trending', handleGetTrending);
app.post('/api/v1/feeds/:id/report', authRequired, handleReportFeed);

// Share
app.post('/api/v1/feeds/:id/share', handleShareFeed);

// Edit feed
app.put('/api/v1/feeds/:id', authRequired, handleEditFeed);

// Follow
app.post('/api/v1/users/:id/follow', authRequired, handleFollow);
app.delete('/api/v1/users/:id/follow', authRequired, handleUnfollow);
app.get('/api/v1/users/:id/followers', handleGetFollowers);
app.get('/api/v1/users/:id/following', handleGetFollowing);

// Messages
app.post('/api/v1/conversations/users/:userId', authRequired, handleCreateConversation);
app.get('/api/v1/conversations', authRequired, handleGetConversations);
app.post('/api/v1/conversations/:id/messages', authRequired, handleSendMessage);
app.get('/api/v1/conversations/:id/messages', authRequired, handleGetMessages);

// Stats & Points
app.get('/api/v1/users/:id/stats', handleGetUserStats);
app.get('/api/v1/users/me/points', authRequired, handleGetPoints);

// Notification Settings
app.get('/api/v1/settings/notifications', authRequired, handleGetNotifSettings);
app.put('/api/v1/settings/notifications', authRequired, handleUpdateNotifSettings);

// Upload
app.post('/api/v1/upload', authRequired, upload.single('file'), handleUpload);
app.post('/api/v1/upload/multiple', authRequired, upload.array('files', 9), handleUploadMultiple);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Search
app.get('/api/v1/search', handleSearch);

// Notifications
app.get('/api/v1/notifications', authRequired, handleGetNotifications);
app.put('/api/v1/notifications/read-all', authRequired, handleMarkAllRead);
app.put('/api/v1/notifications/:id/read', authRequired, handleMarkRead);

// Products
app.post('/api/v1/products', authRequired, handleCreateProduct);
app.get('/api/v1/products', handleGetProducts);
app.get('/api/v1/products/mine', authRequired, handleGetMyProducts);
app.get('/api/v1/products/:id', handleGetProductById);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`[PetHub] Server running on http://localhost:${config.port}`);
});

export default app;
