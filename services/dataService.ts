
import { PageItem } from '../types';

let cloudStorage: PageItem[] | null = null;
const SIMULATED_LATENCY = 500;

export const getInitialData = (): PageItem[] => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);

  return [
    {
      id: 'folder-1',
      name: 'Productivity Hub',
      type: 'folder',
      parentId: null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'page-1',
      name: 'Getting Started',
      type: 'page',
      parentId: 'folder-1',
      icon: '🚀',
      content: `# Welcome to your new Productivity Hub!

This is a page. You can write notes, document ideas, or plan your work here using Markdown.

## Rich Content Embeds

You can now embed content from other platforms directly into your notes! Use the "View Mode" toggle in the editor to see your embeds in action.

### YouTube

To embed a YouTube video, use the format: \`@[youtube](YOUTUBE_URL)\`

**Example:**
@[youtube](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

### Spotify

To embed a Spotify track, use the format: \`@[spotify](SPOTIFY_URL)\`

**Example:**
@[spotify](https://open.spotify.com/track/4cOdK2wGLETOMs3k9yP1Qf)
`,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'meeting-1',
      name: 'Team Sync - Standup',
      type: 'meeting',
      parentId: 'folder-1',
      icon: '🎙️',
      content: `### Agenda
- Review previous action items
- Discuss current sprint progress
- Blockers and challenges

### Notes
- Awaiting feedback from the design team on the new mockups.
`,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'sketch-1',
      name: 'Brainstorming Sketch',
      type: 'sketch',
      parentId: 'folder-1',
      icon: '🎨',
      paperStyle: 'plain',
      content: '', // Starts empty
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'db-1',
      name: 'Project Roadmap',
      type: 'database',
      parentId: 'folder-1',
      icon: '🗺️',
      schema: [
        { id: 'prop-1', name: 'Task', type: 'text' },
        {
          id: 'prop-2',
          name: 'Status',
          type: 'status',
          options: [
            { id: 'opt-1', name: 'To Do', color: 'bg-neutral-800' },
            { id: 'opt-2', name: 'In Progress', color: 'bg-neutral-700' },
            { id: 'opt-3', name: 'Done', color: 'bg-neutral-600' },
          ],
        },
        {
          id: 'prop-3',
          name: 'Priority',
          type: 'status',
          options: [
            { id: 'prio-1', name: 'Low', color: 'bg-sky-700' },
            { id: 'prio-2', name: 'Medium', color: 'bg-yellow-700' },
            { id: 'prio-3', name: 'High', color: 'bg-red-700' },
          ],
        },
        {
          id: 'prop-4',
          name: 'Tags',
          type: 'tag',
          options: [
            { id: 'opt-4', name: 'Urgent', color: 'bg-red-700' },
            { id: 'opt-5', name: 'Feature', color: 'bg-neutral-700' },
            { id: 'opt-6', name: 'Bug', color: 'bg-rose-700' },
          ],
        },
        { id: 'prop-5', name: 'Due Date', type: 'date' },
      ],
      views: [
        { id: 'view-1', type: 'table', name: 'Table View' },
        { id: 'view-2', type: 'gallery', name: 'Gallery View' },
        { id: 'view-3', type: 'calendar', name: 'Calendar' },
      ],
      activeViewId: 'view-3',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'db-page-1',
      name: 'Design the new dashboard',
      type: 'page',
      parentId: 'db-1',
      icon: '🎨',
      coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1470&auto=format&fit=crop',
      properties: {
        'prop-1': 'Design the new dashboard',
        'prop-2': 'opt-2', // In Progress
        'prop-3': 'prio-3', // High
        'prop-4': ['opt-5'], // Feature
        'prop-5': tomorrow.toISOString().split('T')[0],
      },
      content: 'Flesh out the designs in Figma.',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'db-page-2',
      name: 'Fix login button bug',
      type: 'page',
      parentId: 'db-1',
      icon: '🐞',
      coverImage: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?q=80&w=1470&auto=format&fit=crop',
      properties: {
        'prop-1': 'Fix login button bug',
        'prop-2': 'opt-1', // To Do
        'prop-3': 'prio-3', // High
        'prop-4': ['opt-4', 'opt-6'], // Urgent, Bug
        'prop-5': now.toISOString().split('T')[0],
      },
      content: 'The login button is not working on Safari.',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
     {
      id: 'db-page-3',
      name: 'Release version 2.0',
      type: 'page',
      parentId: 'db-1',
      icon: '🎉',
      coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1470&auto=format&fit=crop',
      properties: {
        'prop-1': 'Release version 2.0',
        'prop-2': 'opt-3', // Done
        'prop-3': 'prio-2', // Medium
        'prop-4': ['opt-5'], // Feature
        'prop-5': nextWeek.toISOString().split('T')[0],
      },
      content: 'Deploy the new version to production.',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'spreadsheet-1',
      name: 'Q3 Budget',
      type: 'spreadsheet',
      parentId: 'folder-1',
      icon: '📊',
      content: JSON.stringify([
        ['Item', 'Category', 'Budget', 'Actual', 'Variance'],
        ['Office Supplies', 'Operations', '1000', '850', '150'],
        ['Software Licenses', 'Tech', '2500', '2500', '0'],
        ['Marketing Campaign', 'Marketing', '5000', '6200', '-1200'],
      ]),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'presentation-1',
      name: 'Quarterly Review',
      type: 'presentation',
      parentId: 'folder-1',
      icon: '📽️',
      slides: [
        { id: 's1', title: 'Q3 Quarterly Review', content: '### A look back at our performance' },
        { id: 's2', title: 'Key Wins', content: '- Launched new dashboard\n- Increased user engagement by 20%\n- Hired 3 new engineers' },
        { id: 's3', title: 'Challenges', content: '- Unexpected server costs\n- Login bug on Safari (fixed)\n- Competitor X launched new feature' },
        { id: 's4', title: 'Next Steps for Q4', content: '- Finalize version 2.0 release\n- Begin work on mobile app\n- Explore new marketing channels' },
      ],
      theme: 'default-dark',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  ];
};

export const fetchItems = async (): Promise<PageItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (cloudStorage === null) {
        cloudStorage = getInitialData();
      }
      resolve(JSON.parse(JSON.stringify(cloudStorage)));
    }, SIMULATED_LATENCY);
  });
};

export const saveItems = async (items: PageItem[]): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!Array.isArray(items)) {
        return reject(new Error("Invalid data format: expected an array."));
      }
      cloudStorage = JSON.parse(JSON.stringify(items));
      resolve(true);
    }, SIMULATED_LATENCY);
  });
};