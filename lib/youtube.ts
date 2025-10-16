const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = "https://www.googleapis.com/youtube/v3";

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount?: number;
}

export interface YouTubeChannel {
  id: string;
  title: string;
  thumbnailUrl: string;
  subscriberCount?: number;
}

export async function fetchChannelInfo(channelId: string): Promise<YouTubeChannel | null> {
  try {
    const url = `${BASE_URL}/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return null;
    }

    const channel = data.items[0];
    return {
      id: channel.id,
      title: channel.snippet.title,
      thumbnailUrl: channel.snippet.thumbnails.high.url,
      subscriberCount: parseInt(channel.statistics.subscriberCount || "0"),
    };
  } catch (error) {
    console.error("Error fetching channel info:", error);
    return null;
  }
}

export async function fetchChannelVideos(
  channelId: string,
  maxResults: number = 25
): Promise<YouTubeVideo[]> {
  try {
    // First, get the uploads playlist ID
    const channelUrl = `${BASE_URL}/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    const channelResponse = await fetch(channelUrl);
    const channelData = await channelResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
      return [];
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // Fetch videos from uploads playlist
    const playlistUrl = `${BASE_URL}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`;
    const playlistResponse = await fetch(playlistUrl);
    const playlistData = await playlistResponse.json();

    if (!playlistData.items) {
      return [];
    }

    // Get video IDs to fetch statistics
    const videoIds = playlistData.items.map((item: any) => item.snippet.resourceId.videoId);
    const videosUrl = `${BASE_URL}/videos?part=snippet,statistics&id=${videoIds.join(",")}&key=${YOUTUBE_API_KEY}`;
    const videosResponse = await fetch(videosUrl);
    const videosData = await videosResponse.json();

    return videosData.items.map((video: any) => ({
      id: video.id,
      title: video.snippet.title,
      thumbnailUrl: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high.url,
      channelTitle: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
      viewCount: parseInt(video.statistics.viewCount || "0"),
      likeCount: parseInt(video.statistics.likeCount || "0"),
      commentCount: parseInt(video.statistics.commentCount || "0"),
    }));
  } catch (error) {
    console.error("Error fetching channel videos:", error);
    return [];
  }
}

export async function fetchTrendingVideos(
  regionCode: string = "TR",
  maxResults: number = 50
): Promise<YouTubeVideo[]> {
  try {
    const url = `${BASE_URL}/videos?part=snippet,statistics&chart=mostPopular&regionCode=${regionCode}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.items) {
      return [];
    }

    return data.items.map((video: any) => ({
      id: video.id,
      title: video.snippet.title,
      thumbnailUrl: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high.url,
      channelTitle: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
      viewCount: parseInt(video.statistics.viewCount || "0"),
      likeCount: parseInt(video.statistics.likeCount || "0"),
      commentCount: parseInt(video.statistics.commentCount || "0"),
    }));
  } catch (error) {
    console.error("Error fetching trending videos:", error);
    return [];
  }
}

