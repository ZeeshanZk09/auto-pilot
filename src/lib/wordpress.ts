import axios from 'axios';

interface WordPressConfig {
  url: string;
  username: string;
  appPassword: string;
}

interface PostData {
  title: string;
  content: string;
  status: 'publish' | 'draft';
  categories?: number[];
  tags?: number[];
}

export async function publishToWordPress(config: WordPressConfig, post: PostData) {
  try {
    const credentials = `${config.username}:${config.appPassword}`;
    const authHeader = `Basic ${Buffer.from(credentials).toString('base64')}`;

    // Normalize URL
    const baseUrl = config.url.replace(/\/$/, '');
    const apiEndpoint = `${baseUrl}/wp-json/wp/v2/posts`;

    const response = await axios.post(apiEndpoint, post, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      link: response.data.link,
      id: response.data.id,
    };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message: string };
    console.error(`WP Publish error to ${config.url}:`, err.response?.data || err.message);
    return {
      success: false,
      error: err.response?.data?.message || err.message,
    };
  }
}

export async function testWPConnection(config: WordPressConfig) {
  try {
    const credentials = `${config.username}:${config.appPassword}`;
    const authHeader = `Basic ${Buffer.from(credentials).toString('base64')}`;
    const baseUrl = config.url.replace(/\/$/, '');

    // Attempt to fetch current user (requires authentication)
    const response = await axios.get(`${baseUrl}/wp-json/wp/v2/users/me`, {
      headers: { Authorization: authHeader },
    });

    return { success: true, user: response.data.name };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message: string };
    return { success: false, error: err.response?.data?.message || err.message };
  }
}
