"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  text: string;
  author: {
    name: string;
    avatarUrl?: string;
  };
  createdAt: Date;
}

interface CollabSidebarProps {
  comments: Comment[];
  onAddComment: (text: string) => Promise<void>;
  targetType?: string;
  targetRef?: string;
}

export function CollabSidebar({
  comments,
  onAddComment,
  targetType,
  targetRef,
}: CollabSidebarProps) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(newComment);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <h2 className="font-semibold">Comments</h2>
          <span className="text-sm text-gray-500">({comments.length})</span>
        </div>
      </div>

      {/* Comments List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                  {comment.author.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-sm">{comment.author.name}</span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                    {comment.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No comments yet. Be the first to comment!
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Add Comment Form */}
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <Button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? "Sending..." : "Send"}
          </Button>
        </form>
      </div>
    </div>
  );
}

