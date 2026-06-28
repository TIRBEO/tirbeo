-- ============================================================
-- Tirbeo Chat Documentation Seed — Migration 003
-- Moves all chat docs from hardcoded React to DB-driven content
-- ============================================================

-- Step 1: Create the "Tirbeo Chat" category
INSERT INTO doc_categories (id, title, slug, description, sort_order, is_active)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'Tirbeo Chat',
  'chat',
  'Real-time messaging for professional communities — channels, threads, and voice/video calls.',
  0,
  true
) ON CONFLICT (slug) DO NOTHING;

-- Step 2: Insert all 18 chat documentation articles
-- We use a fixed UUID base for idempotency and reference the category_id above.

-- 2.1 Overview
INSERT INTO doc_articles (id, category_id, title, slug, content, sort_order, is_published)
SELECT
  'c0010000-0000-0000-0000-000000000001', id, 'Overview', 'overview',
  E'## Overview\n\nTirbeo Chat is a real-time messaging product from Tirbeo. It''s designed for professional communities that need clean, distraction-free communication.\n\nThink of it as the **professional alternative to Discord** — all the real-time messaging power, none of the gamer aesthetic.\n\n> Tirbeo Chat uses Tirbeo Identity for authentication — one account across all Tirbeo products.\n\n## Key Features\n\n| Feature | Description |\n|---------|-------------|\n| Real-Time Messaging | Instant message delivery with WebSocket |\n| Channels | Organized conversations (text, voice, announcements) |\n| Threads | Focused conversations that keep main channels clean |\n| Direct Messages | Private 1-on-1 conversations |\n| Rich Text | Markdown formatting with code highlighting |\n| File Sharing | Drag-and-drop uploads with previews |\n| Voice & Video Calls | HD calls with screen sharing |\n| Presence & Status | Online/Away/DND status with custom status |\n| Message Search | Full-text search with filters |\n| Pinned Messages | Important messages saved for reference |\n| Emoji Reactions | Rich emoji support with quick reactions |\n| @Mentions | Notify users, channels, or roles |\n| Edit/Delete | Edit or delete your own messages |\n| Notifications | In-app, email, and push notifications |\n\n## Platform Comparison\n\n| Feature | Tirbeo Chat | Discord | Slack | Reddit | Notion | Circle.so |\n|---------|-------------|---------|-------|--------|--------|-----------|\n| Professional UI | Yes | No | Yes | No | Yes | Yes |\n| Community-Centric | Yes | Yes | No | Yes | No | Yes |\n| Real-Time Chat | Yes | Yes | Yes | No | No | Yes |\n| Threaded Discussions | Yes | No | Yes | Yes | No | Yes |\n| Resource Library | Yes | No | No | No | Yes | No |\n| Project Management | Yes | No | No | No | Yes | No |\n| Events & RSVP | Yes | No | No | No | No | Yes |\n| Wiki / Knowledge Base | Yes | No | No | No | Yes | No |\n| Member Profiles | Yes | Yes | Yes | Yes | No | Yes |\n| Dark / Light Mode | Yes | Yes | Yes | No | Yes | Yes |',
  0, true
FROM doc_categories WHERE slug = 'chat'
ON CONFLICT (category_id, slug) DO NOTHING;

-- 2.2 Getting Started
INSERT INTO doc_articles (id, category_id, title, slug, content, sort_order, is_published)
SELECT
  'c0010000-0000-0000-0000-000000000002', id, 'Getting Started', 'getting-started',
  E'## Getting Started with Tirbeo Chat\n\n### 1. Access Chat\n\n1. **Log in** — Log in to your Tirbeo account via account.tirbeo.com\n2. **Navigate to a community** — Select any community you''ve joined from your dashboard.\n3. **Click Chat** — Click the "Chat" tab in the navigation.\n\n### 2. Select a Channel\n\nOn the left panel, you''ll see a list of channels organized by category.\n\n| Type | Description |\n|------|-------------|\n| Text Channel | Real-time text messaging |\n| Voice Channel | Voice and video calls |\n| Announcement Channel | Admin-only posting, everyone reads |\n| Locked Channel | Read-only for most members |\n| Archived Channel | Read-only historical channels |\n\n### 3. Send Your First Message\n\n1. **Select a channel** — Choose a channel like #general.\n2. **Type your message** — Write your message in the input box at the bottom.\n3. **Press Enter** — Your message is sent instantly to everyone in the channel.\n\n### 4. Message Formatting\n\n| Format | Syntax | Example |\n|--------|--------|---------|\n| Bold | **text** | **text** |\n| Italic | *text* | *text* |\n| Strikethrough | ~~text~~ | ~~text~~ |\n| Inline Code | `code` | `code` |\n| Code Block | ```language | Multi-line code |\n| Link | [text](url) | [Link](https://example.com) |\n| Quote | > text | Block quote |\n\n### 5. Upload a File\n\n1. **Click attachment** — Click the attachment icon or drag and drop a file.\n2. **Select file** — Choose a file from your computer (up to 25MB).\n3. **Send** — Wait for upload to complete, then press Enter.\n\n### 6. Reply in a Thread\n\nHover over any message and click the thread icon to reply. Your reply will be organized under the parent message, keeping the main channel clean.',
  1, true
FROM doc_categories WHERE slug = 'chat'
ON CONFLICT (category_id, slug) DO NOTHING;

-- 2.3 Channels
INSERT INTO doc_articles (id, category_id, title, slug, content, sort_order, is_published)
SELECT
  'c0010000-0000-0000-0000-000000000003', id, 'Channels', 'channels',
  E'## Channels\n\n### Channel Types\n\n| Type | Description |\n|------|-------------|\n| Text Channel | Real-time text messaging |\n| Voice Channel | Voice and video calls |\n| Announcement Channel | Admin-only posting, everyone reads |\n| Locked Channel | Read-only for most members |\n| Archived Channel | Read-only, searchable history preserved |\n\n### Channel Categories\n\nGroup channels into collapsible sections for organization:\n\n```\nMAIN\n  # general\n  # announcements\nPROJECTS\n  # project-alpha\n  # project-beta\nTEAMS\n  # design\n  # engineering\n  # marketing\n```\n\n### Channel Permissions\n\n| Permission | Description |\n|------------|-------------|\n| Read | View channel messages |\n| Send Messages | Post messages in the channel |\n| Create Threads | Start threaded conversations |\n| Pin Messages | Pin important messages |\n| Manage Channel | Edit channel settings |\n| Delete Messages | Delete others'' messages |',
  2, true
FROM doc_categories WHERE slug = 'chat'
ON CONFLICT (category_id, slug) DO NOTHING;

-- 2.4 Messaging
INSERT INTO doc_articles (id, category_id, title, slug, content, sort_order, is_published)
SELECT
  'c0010000-0000-0000-0000-000000000004', id, 'Messaging', 'messaging',
  E'## Messaging\n\n### Message Actions\n\n| Action | How To | Description |\n|--------|--------|-------------|\n| Send | Enter | Send your message |\n| Edit | Click edit icon | Edit your message (shows edit history) |\n| Delete | Click delete icon | Soft delete (shows deleted message) |\n| Reply in Thread | Click thread icon | Open thread in right panel |\n| React | Click emoji icon | Add emoji reaction |\n| Pin | Click pin icon | Pin to right panel |\n| Copy | Click copy icon | Copy message to clipboard |\n| Bookmark | Click bookmark icon | Save for later |\n| Report | Click menu > Report | Flag for moderator review |\n\n### Message Formatting\n\n| Format | Syntax | Example |\n|--------|--------|---------|\n| Bold | **text** | **text** |\n| Italic | *text* | *text* |\n| Strikethrough | ~~text~~ | ~~text~~ |\n| Inline Code | `code` | `code` |\n| Code Block | ```language...``` | Multi-line code |\n| Link | [text](url) | [Link](https://example.com) |\n| Quote | > text | Block quote |\n\n### Code Blocks\n\nSupported languages: JavaScript, TypeScript, Python, HTML, CSS, JSON, SQL, Rust, Go, C++, and 30+ more.\n\n```javascript\nfunction greet(name) {\n  console.log(\`Hello, \${name}! Welcome to Tirbeo Chat.\`);\n}\n```\n\n### Message Elements\n\n| Element | Description |\n|---------|-------------|\n| Author Avatar | Profile picture of the sender |\n| Author Name | Display name of the sender |\n| Timestamp | When the message was sent |\n| Message Content | The actual message text with formatting |\n| Attachments | Files, images, or links attached |\n| Reactions | Emoji reactions from others |\n| Thread Indicator | Shows if message has replies |\n| Edit Indicator | Shows "(edited)" for edited messages |\n| Reply Indicator | Shows if replying to someone |',
  3, true
FROM doc_categories WHERE slug = 'chat'
ON CONFLICT (category_id, slug) DO NOTHING;

-- 2.5 Threads
INSERT INTO doc_articles (id, category_id, title, slug, content, sort_order, is_published)
SELECT
  'c0010000-0000-0000-0000-000000000005', id, 'Threads', 'threads',
  E'## Threads\n\n### What Are Threads\n\nThreads are focused conversations attached to a specific message, keeping the main channel clean while allowing deep discussion.\n\n### Thread Features\n\n| Feature | Description |\n|---------|-------------|\n| Organization | All replies organized under parent message |\n| Indicators | Distinct thread indicator and unread count |\n| Mentions | Thread participants can be @mentioned |\n| Auto-Close | Threads close after 30 days of inactivity |\n| Side Panel | Thread opens in right panel |\n| Jump to Message | Click to jump to thread in channel |\n\n### Starting a Thread\n\n1. **Hover over a message** — Find any message in a channel.\n2. **Click the thread icon** — The thread panel opens on the right.\n3. **Type your reply** — Press Enter to send. All replies are organized in the thread.',
  4, true
FROM doc_categories WHERE slug = 'chat'
ON CONFLICT (category_id, slug) DO NOTHING;

-- 2.6 @Mentions
INSERT INTO doc_articles (id, category_id, title, slug, content, sort_order, is_published)
SELECT
  'c0010000-0000-0000-0000-000000000006', id, '@Mentions', 'mentions',
  E'## @Mentions\n\n### Mention Types\n\n| Type | Syntax | Who Gets Notified |\n|------|--------|------------------|\n| User Mention | @username | Specific user |\n| Channel Mention | @channel | Everyone in the channel |\n| Here Mention | @here | Active online members |\n| Role Mention | @role | All members with that role |\n\n### Mention Suggestions\n\n1. **Type @** — A dropdown appears with user suggestions.\n2. **Search** — Type to filter by display name or username.\n3. **Select** — Press Enter to select the mention.\n\n### Mention Examples\n\n```\n@alexchen — Mentions Alex Chen\n@channel — Notifies everyone in the channel\n@here — Notifies active online members\n@moderators — Notifies all moderators\n```',
  5, true
FROM doc_categories WHERE slug = 'chat'
ON CONFLICT (category_id, slug) DO NOTHING;

-- 2.7 Emoji Reactions
INSERT INTO doc_articles (id, category_id, title, slug, content, sort_order, is_published)
SELECT
  'c0010000-0000-0000-0000-000000000007', id, 'Emoji Reactions', 'emoji',
  E'## Emoji Reactions\n\n### Adding Reactions\n\n1. **Hover over a message** — The reaction toolbar appears.\n2. **Click the emoji icon** — The emoji picker opens.\n3. **Select an emoji** — Your reaction is added immediately. Click existing reactions to add your vote.\n\n### Quick Reactions\n\n| Emoji | Name | Meaning |\n|-------|------|---------|\n| 🚀 | Rocket | Exciting, ready to launch |\n| 💡 | Lightbulb | Good idea |\n| 👍 | Thumbs Up | Agree, like |\n| ❤️ | Red Heart | Love, appreciate |\n| 😄 | Laughing | Funny |\n| ✅ | Check | Complete, yes |\n\n### Reaction Features\n\n| Feature | Description |\n|---------|-------------|\n| Unlimited | No limit on reactions per message |\n| Multiple Emojis | Can add multiple different emojis |\n| Reaction Count | Shows number of each reaction |\n| Reaction List | Hover to see who reacted |\n| Add/Remove | Click to toggle your reaction |',
  6, true
FROM doc_categories WHERE slug = 'chat'
ON CONFLICT (category_id, slug) DO NOTHING;

-- 2.8 File Sharing
INSERT INTO doc_articles (id, category_id, title, slug, content, sort_order, is_published)
SELECT
  'c0010000-0000-0000-0000-000000000008', id, 'File Sharing', 'files',
  E'## File Sharing\n\n### Supported File Types\n\n| Category | Formats | Max Size |\n|----------|---------|----------|\n| Images | PNG, JPG, GIF, SVG, WebP | 25MB |\n| Documents | PDF, DOCX, XLSX, PPTX, TXT | 25MB |\n| Code | ZIP, TAR, GZ, RAR | 25MB |\n| Video | MP4, MOV, AVI, WEBM | 25MB |\n| Audio | MP3, WAV, M4A | 25MB |\n| Other | Any file type | 25MB |\n\n### Upload Methods\n\n| Method | Description |\n|--------|-------------|\n| Drag and Drop | Drag file into chat input area |\n| Click to Upload | Click the attachment icon |\n| Paste from Clipboard | Paste image (CMD+V) |\n| Copy/Paste | Copy file and paste |\n\n### File Previews\n\n| File Type | Preview |\n|-----------|---------|\n| Images | Inline thumbnail with click-to-expand lightbox |\n| Videos | Inline player with playback controls |\n| Documents | File icon with name and size |\n| Links | OG metadata card (title, description, image) |',
  7, true
FROM doc_categories WHERE slug = 'chat'
ON CONFLICT (category_id, slug) DO NOTHING;

-- 2.9 Voice & Video
INSERT INTO doc_articles (id, category_id, title, slug, content, sort_order, is_published)
SELECT
  'c0010000-0000-0000-0000-000000000009', id, 'Voice & Video', 'voice',
  E'## Voice & Video\n\n### Starting a Call\n\n1. **Navigate to a voice channel** — Click any voice channel in the sidebar.\n2. **Click Join Voice** — Your camera and microphone will connect.\n3. **Share Screen (optional)** — Click "Share Screen" to present your screen.\n\n### Call Controls\n\n| Control | Description |\n|---------|-------------|\n| Mute/Unmute | Toggle microphone on/off |\n| Camera On/Off | Toggle video on/off |\n| Share Screen | Share entire screen or specific window |\n| Noise Suppression | Background noise removal |\n| Record Call | Record for later (admin permission) |\n| View Participants | See who''s in the call |\n| In-Call Chat | Text chat during calls |\n| End Call | Leave the voice channel |\n\n### Call Features\n\n| Feature | Description |\n|---------|-------------|\n| Video Quality | HD video up to 1080p |\n| Audio Quality | Noise suppression and echo cancellation |\n| Screen Sharing | Share entire screen or specific window |\n| Recording | Record calls for later (admin permission) |\n| Background Blur | Blur background for privacy |\n| Virtual Backgrounds | Custom backgrounds |\n| Raise Hand | Indicate you want to speak |',
  8, true
FROM doc_categories WHERE slug = 'chat'
ON CONFLICT (category_id, slug) DO NOTHING;

-- 2.10 Presence & Status
INSERT INTO doc_articles (id, category_id, title, slug, content, sort_order, is_published)
SELECT
  'c0010000-0000-0000-0000-000000000010', id, 'Presence & Status', 'presence',
  E'## Presence & Status\n\n### Status Indicators\n\n| Status | Color | Description |\n|--------|-------|-------------|\n| Online | Green | Active on the platform |\n| Away | Yellow | Inactive for 15+ minutes |\n| Do Not Disturb | Red | Not receiving notifications |\n| Offline | Gray | Not currently active |\n\n### Custom Status\n\n1. **Click your avatar** — Open your user menu.\n2. **Click Set Status** — Choose an emoji and short text.\n3. **Set expiry (optional)** — Choose a duration or leave as permanent.\n\nExamples: `Writing docs` `Vacation until Friday` `In a meeting`\n\n### Typing Indicator\n\nWhen someone is composing a message, you''ll see *"X is typing..."* after 2+ seconds of typing. Shows up to 3 names.\n\n### Last Seen\n\nShown in DM headers: "Last seen today at 2:30 PM", "Last seen yesterday", "Last seen this week".',
  9, true
FROM doc_categories WHERE slug = 'chat'
ON CONFLICT (category_id, slug) DO NOTHING;

-- 2.11 Direct Messages
INSERT INTO doc_articles (id, category_id, title, slug, content, sort_order, is_published)
SELECT
  'c0010000-0000-0000-0000-000000000011', id, 'Direct Messages', 'dms',
  E'## Direct Messages\n\n### Starting a DM\n\n1. **Click Direct Messages** — Find it in the sidebar.\n2. **Click New DM** — Search for a user by name or username.\n3. **Start chatting** — All messaging features are available in DMs.\n\n### DM Features\n\n| Feature | Description |\n|---------|-------------|\n| Messaging | All messaging features available |\n| Voice Calls | Voice calls supported |\n| Video Calls | Video calls supported |\n| File Sharing | Share files and images |\n| Status | See each other''s status |\n| Typing Indicator | See when the other is typing |\n| Read Receipts | See if message was read |\n| Message Requests | Pending approval for non-friends |\n\n### Message Requests\n\nWhen someone you don''t follow sends a DM, you''ll receive a message request:\n\n> **Message Request**\n> Unknown User sent you a message: "Hey, I saw your post about..."\n>\n> [Accept] [Decline] [Block]',
  10, true
FROM doc_categories WHERE slug = 'chat'
ON CONFLICT (category_id, slug) DO NOTHING;

-- 2.12 Message Search
INSERT INTO doc_articles (id, category_id, title, slug, content, sort_order, is_published)
SELECT
  'c0010000-0000-0000-0000-000000000012', id, 'Message Search', 'search',
  E'## Message Search\n\n### Search Features\n\n| Feature | Description |\n|---------|-------------|\n| Full-Text | Search all message content |\n| User Filter | from:@username |\n| Date Filter | before:date, after:date |\n| Content Type | has:image, has:file, has:link |\n| Channel Filter | in:#channel-name |\n| Highlight | Search terms highlighted in results |\n| Jump to Context | Click to jump to message in channel |\n\n### Search Examples\n\n```\nhackathon\n  → Find all messages containing "hackathon"\n\nfrom:alexchen hackathon\n  → Find hackathon messages from Alex Chen\n\nafter:2026-06-20\n  → Find messages after June 20, 2026\n\nhas:image\n  → Find messages with images\n\nin:#general hackathon\n  → Find hackathon messages in #general\n```',
  11, true
FROM doc_categories WHERE slug = 'chat'
ON CONFLICT (category_id, slug) DO NOTHING;

-- 2.13 Pinned Messages
INSERT INTO doc_articles (id, category_id, title, slug, content, sort_order, is_published)
SELECT
  'c0010000-0000-0000-0000-000000000013', id, 'Pinned Messages', 'pin',
  E'## Pinned Messages\n\n### Pinning Messages\n\n1. **Hover over a message** — The message toolbar appears.\n2. **Click the pin icon** — The message is pinned to the channel.\n3. **View pinned messages** — Open the pinned panel from the channel header.\n\n### Pinned Messages Panel\n\nThe pinned messages panel shows all pinned messages for the current channel, organized by most recent.',
  12, true
FROM doc_categories WHERE slug = 'chat'
ON CONFLICT (category_id, slug) DO NOTHING;

-- 2.14 Notifications
INSERT INTO doc_articles (id, category_id, title, slug, content, sort_order, is_published)
SELECT
  'c0010000-0000-0000-0000-000000000014', id, 'Notifications', 'notifications',
  E'## Notifications\n\n### In-App Notifications\n\n| Feature | Description |\n|---------|-------------|\n| Bell Icon | Notification center in header |\n| Grouping | Grouped by community and type |\n| Priority | Mentions > Replies > Other |\n| Mark as Read | Individual or all |\n| Dismiss | Dismiss individual notifications |\n\n### Notification Types\n\n| Type | Description |\n|------|-------------|\n| @Mention | Someone mentioned you |\n| Reply | Someone replied to your message |\n| Thread | Someone replied in a thread you''re in |\n| DM | New direct message |\n| Reaction | Someone reacted to your message |\n| Pin | Someone pinned your message |\n| Join | New member joined the community |\n\n### Notification Settings\n\n| Setting | Description |\n|---------|-------------|\n| All Messages | Notify for every message |\n| Only Mentions | Notify only when @mentioned |\n| Custom | Per-channel customization |\n| Mute Channel | No notifications from this channel |\n| Mute Community | No notifications from this community |',
  13, true
FROM doc_categories WHERE slug = 'chat'
ON CONFLICT (category_id, slug) DO NOTHING;

-- 2.15 Authentication
INSERT INTO doc_articles (id, category_id, title, slug, content, sort_order, is_published)
SELECT
  'c0010000-0000-0000-0000-000000000015', id, 'Authentication', 'authentication',
  E'## Authentication\n\n### Sign Up\n\nTirbeo Chat uses Tirbeo Identity — the central authentication system for all Tirbeo products.\n\n1. **Visit account.tirbeo.com** — Go to the sign-up page.\n2. **Enter your email** — Or use OAuth: Google, GitHub, Discord.\n3. **Verify your email** — Enter the 6-digit OTP sent to your inbox.\n\n### Login\n\n1. **Visit account.tirbeo.com** — Go to the login page.\n2. **Enter credentials** — Email and password, or use OAuth.\n3. **Complete MFA** — If enabled, enter your 2FA code.\n\nYou''re now logged in to all Tirbeo products!\n\n### Multi-Factor Authentication\n\n| Method | Description |\n|--------|-------------|\n| TOTP | Time-based one-time password (Google Authenticator, etc.) |\n| SMS | 6-digit code sent via text message |\n| Backup Codes | 8 single-use codes for recovery |\n\n> ⚠️ Keep recovery codes secure. Losing both your authenticator and recovery codes may lock you out.',
  14, true
FROM doc_categories WHERE slug = 'chat'
ON CONFLICT (category_id, slug) DO NOTHING;

-- 2.16 Administration
INSERT INTO doc_articles (id, category_id, title, slug, content, sort_order, is_published)
SELECT
  'c0010000-0000-0000-0000-000000000016', id, 'Administration', 'administration',
  E'## Administration\n\n### Admin Dashboard\n\n| Metric | Description |\n|--------|-------------|\n| Total Members | Active community members |\n| New This Week | New member count |\n| Posts This Week | Discussion posts |\n| Active Now | Currently online |\n\n### Member Management\n\nSearchable member table with filter by role, status, and join date. Actions include change role, ban, kick, and send DM.\n\n### Moderation\n\nReported content queue with actions: dismiss, delete, warn user, ban user. Full audit log of all moderator actions.',
  15, true
FROM doc_categories WHERE slug = 'chat'
ON CONFLICT (category_id, slug) DO NOTHING;

-- 2.17 API Reference
INSERT INTO doc_articles (id, category_id, title, slug, content, sort_order, is_published)
SELECT
  'c0010000-0000-0000-0000-000000000017', id, 'API Reference', 'api',
  E'## API Reference\n\n### Base URL\n\n`GET https://api.tirbeo.com/v1`\n\n### Authentication\n\n```shell\ncurl -H "Authorization: Bearer {access_token}" https://api.tirbeo.com/v1/me\n```\n\n### Chat Endpoints\n\n| Endpoint | Method | Description |\n|----------|--------|-------------|\n| /messages/:channelId | GET | Get channel messages |\n| /messages | POST | Send message |\n| /messages/:id | PUT | Edit message |\n| /messages/:id | DELETE | Delete message |\n| /messages/:id/thread | GET | Get thread replies |\n| /messages/:id/pin | POST | Pin message |\n| /messages/:id/unpin | POST | Unpin message |\n| /channels | GET | List channels |\n| /channels | POST | Create channel |\n| /channels/:id | PUT | Update channel |\n| /channels/:id | DELETE | Delete channel |\n| /voice/join/:channelId | POST | Join voice channel |\n| /voice/leave/:channelId | POST | Leave voice channel |',
  16, true
FROM doc_categories WHERE slug = 'chat'
ON CONFLICT (category_id, slug) DO NOTHING;

-- 2.18 FAQ & Support
INSERT INTO doc_articles (id, category_id, title, slug, content, sort_order, is_published)
SELECT
  'c0010000-0000-0000-0000-000000000018', id, 'FAQ & Support', 'faq',
  E'## FAQ & Support\n\n### Frequently Asked Questions\n\n**How do I create a community?**\nClick ''Create Community'' from your dashboard. Fill in the details and you''re ready to go!\n\n**How many members can a community have?**\nFree communities support up to 50 members. Premium plans support unlimited members.\n\n**Can I use Tirbeo Chat on mobile?**\nYes! Tirbeo Chat is fully responsive and works on all devices. We also have a PWA for mobile.\n\n**How do I report a message?**\nHover over the message, click the three dots, and select ''Report''. A moderator will review it.\n\n**Is there a dark mode?**\nYes! Toggle dark/light mode using the theme switcher in the header.\n\n### Contact Support\n\n| Channel | Contact |\n|---------|---------|\n| Email | support@tirbeo.com |\n| Twitter/X | @tirbeo |\n| Community | discord.gg/tirbeo |',
  17, true
FROM doc_categories WHERE slug = 'chat'
ON CONFLICT (category_id, slug) DO NOTHING;
