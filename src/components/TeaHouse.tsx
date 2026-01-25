import { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Heart, 
  Send, 
  X, 
  Image as ImageIcon,
  MoreHorizontal,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  Post, 
  Comment,
  getPosts, 
  createPost, 
  togglePostLike, 
  addComment,
  toggleCommentLike,
  deletePost,
  formatTimeAgo 
} from '../services/communityService';
import { getCurrentAccountId, getUserData } from '../services/userDatabase';

interface TeaHouseProps {
  characterName: string;
}

export function TeaHouse({ characterName }: TeaHouseProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTags, setNewPostTags] = useState('');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState<Record<string, string>>({});
  const [showPostMenu, setShowPostMenu] = useState<string | null>(null);

  const currentUserId = getCurrentAccountId() || 'anonymous';
  const userData = getUserData();
  const userAvatar = characterName.charAt(0).toUpperCase();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = () => {
    const allPosts = getPosts();
    setPosts(allPosts);
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;

    const tags = newPostTags.split(/[,，\s]+/).filter(t => t.trim());
    
    createPost({
      authorId: currentUserId,
      authorName: characterName,
      authorAvatar: userAvatar,
      content: newPostContent.trim(),
      tags: tags.length > 0 ? tags : undefined,
    });

    setNewPostContent('');
    setNewPostTags('');
    setShowNewPost(false);
    loadPosts();
  };

  const handleLikePost = (postId: string) => {
    togglePostLike(postId, currentUserId);
    loadPosts();
  };

  const handleAddComment = (postId: string) => {
    const content = commentContent[postId];
    if (!content?.trim()) return;

    addComment(postId, {
      authorId: currentUserId,
      authorName: characterName,
      authorAvatar: userAvatar,
      content: content.trim(),
    });

    setCommentContent(prev => ({ ...prev, [postId]: '' }));
    loadPosts();
  };

  const handleLikeComment = (postId: string, commentId: string) => {
    toggleCommentLike(postId, commentId, currentUserId);
    loadPosts();
  };

  const handleDeletePost = (postId: string) => {
    if (deletePost(postId, currentUserId)) {
      loadPosts();
    }
    setShowPostMenu(null);
  };

  return (
    <div className="space-y-4">
      {/* 发帖区域 */}
      <div className="bg-white/90 backdrop-blur-sm border-2 border-[#e8e3d6] rounded-2xl p-4 shadow-sm">
        {!showNewPost ? (
          <button
            onClick={() => setShowNewPost(true)}
            className="w-full text-left px-4 py-3 bg-[#f5f1e8] rounded-xl text-[#737373] hover:bg-[#ebe7de] transition-colors"
          >
            分享你的想法...
          </button>
        ) : (
          <div className="space-y-3">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="分享你的学习心得、打卡感受..."
              className="w-full px-4 py-3 bg-[#f5f1e8] rounded-xl text-[#1a1a1a] placeholder-[#a0a0a0] resize-none focus:outline-none focus:ring-2 focus:ring-[#2d5f3f]/20"
              rows={4}
              autoFocus
            />
            <input
              type="text"
              value={newPostTags}
              onChange={(e) => setNewPostTags(e.target.value)}
              placeholder="标签（用逗号分隔，如：学习,打卡,分享）"
              className="w-full px-4 py-2 bg-[#f5f1e8] rounded-xl text-sm text-[#1a1a1a] placeholder-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-[#2d5f3f]/20"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="p-2 text-[#737373] hover:text-[#2d5f3f] hover:bg-[#f5f1e8] rounded-lg transition-colors">
                  <ImageIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowNewPost(false);
                    setNewPostContent('');
                    setNewPostTags('');
                  }}
                  className="px-4 py-2 text-[#737373] hover:text-[#1a1a1a] text-sm font-medium"
                >
                  取消
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim()}
                  className="px-5 py-2 bg-[#2d5f3f] hover:bg-[#3d7a54] text-white rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  发布
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 帖子列表 */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm border-2 border-[#e8e3d6] rounded-2xl p-12 text-center shadow-sm">
            <MessageCircle className="w-12 h-12 text-[#a0a0a0] mx-auto mb-4" />
            <p className="text-[#737373]">还没有帖子，来发布第一条吧！</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-white/90 backdrop-blur-sm border-2 border-[#e8e3d6] rounded-2xl shadow-sm overflow-hidden"
            >
              {/* 帖子头部 */}
              <div className="p-4 pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                      post.authorId === currentUserId 
                        ? 'bg-gradient-to-br from-[#2d5f3f] to-[#3d7a54]' 
                        : 'bg-gradient-to-br from-gray-400 to-gray-500'
                    }`}>
                      {post.authorAvatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#1a1a1a]">{post.authorName}</span>
                        {post.authorId === currentUserId && (
                          <span className="px-1.5 py-0.5 bg-[#2d5f3f] text-white text-xs rounded">我</span>
                        )}
                      </div>
                      <span className="text-xs text-[#a0a0a0]">{formatTimeAgo(post.createdAt)}</span>
                    </div>
                  </div>
                  
                  {post.authorId === currentUserId && (
                    <div className="relative">
                      <button
                        onClick={() => setShowPostMenu(showPostMenu === post.id ? null : post.id)}
                        className="p-1.5 text-[#a0a0a0] hover:text-[#737373] hover:bg-[#f5f1e8] rounded-lg transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {showPostMenu === post.id && (
                        <div className="absolute right-0 top-8 bg-white border border-[#e8e3d6] rounded-xl shadow-lg py-1 z-10">
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                          >
                            <Trash2 className="w-4 h-4" />
                            删除
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 帖子内容 */}
                <div className="mt-3">
                  <p className="text-[#1a1a1a] text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  
                  {/* 标签 */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-[#f5f1e8] text-[#2d5f3f] text-xs rounded-lg"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 互动按钮 */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#f5f1e8]">
                  <button
                    onClick={() => handleLikePost(post.id)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${
                      post.likes.includes(currentUserId)
                        ? 'text-red-500'
                        : 'text-[#737373] hover:text-red-500'
                    }`}
                  >
                    <Heart 
                      className={`w-4 h-4 ${post.likes.includes(currentUserId) ? 'fill-current' : ''}`} 
                    />
                    <span>{post.likes.length > 0 ? post.likes.length : '点赞'}</span>
                  </button>
                  <button
                    onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                    className="flex items-center gap-1.5 text-sm text-[#737373] hover:text-[#2d5f3f] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments.length > 0 ? post.comments.length : '评论'}</span>
                    {post.comments.length > 0 && (
                      expandedPost === post.id 
                        ? <ChevronUp className="w-3 h-3" />
                        : <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              {/* 评论区 */}
              {expandedPost === post.id && (
                <div className="bg-[#faf7f0] border-t-2 border-[#e8e3d6] p-4">
                  {/* 评论输入 */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2d5f3f] to-[#3d7a54] flex items-center justify-center text-white text-sm font-medium">
                      {userAvatar}
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={commentContent[post.id] || ''}
                        onChange={(e) => setCommentContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder="写下你的评论..."
                        className="flex-1 px-3 py-2 bg-white border border-[#e8e3d6] rounded-xl text-sm focus:outline-none focus:border-[#2d5f3f]/30"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment(post.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={!commentContent[post.id]?.trim()}
                        className="p-2 bg-[#2d5f3f] text-white rounded-xl hover:bg-[#3d7a54] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 评论列表 */}
                  {post.comments.length > 0 ? (
                    <div className="space-y-3">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0 ${
                            comment.authorId === currentUserId
                              ? 'bg-gradient-to-br from-[#2d5f3f] to-[#3d7a54]'
                              : 'bg-gradient-to-br from-gray-400 to-gray-500'
                          }`}>
                            {comment.authorAvatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="bg-white rounded-xl px-3 py-2">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-[#1a1a1a]">{comment.authorName}</span>
                                {comment.authorId === currentUserId && (
                                  <span className="px-1 py-0.5 bg-[#2d5f3f] text-white text-[10px] rounded">我</span>
                                )}
                              </div>
                              <p className="text-sm text-[#4a4a4a]">{comment.content}</p>
                            </div>
                            <div className="flex items-center gap-3 mt-1 px-1">
                              <span className="text-xs text-[#a0a0a0]">{formatTimeAgo(comment.createdAt)}</span>
                              <button
                                onClick={() => handleLikeComment(post.id, comment.id)}
                                className={`flex items-center gap-1 text-xs transition-colors ${
                                  comment.likes.includes(currentUserId)
                                    ? 'text-red-500'
                                    : 'text-[#a0a0a0] hover:text-red-500'
                                }`}
                              >
                                <Heart className={`w-3 h-3 ${comment.likes.includes(currentUserId) ? 'fill-current' : ''}`} />
                                {comment.likes.length > 0 && comment.likes.length}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#a0a0a0] text-center py-4">暂无评论，来抢沙发吧</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
