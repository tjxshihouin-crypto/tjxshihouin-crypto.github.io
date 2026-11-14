/* data.js — THE one file to edit for your content.
   Personal portfolio: TJ · Developer Relations. */
(function () {
  'use strict';
  const LAB = (window.LAB = window.LAB || {});

  LAB.data = {
    site: {
      name: 'TJ',
      fullName: 'TyShawn (TJ) Hill',
      handle: 'TJxSHIHOUIN',
      brand: 'NXT-G3NERATION',
      brandTagline: 'A consortium of tech creators creating content.',
      role: 'Developer Relations · Software Engineer · Creator',
      location: 'Los Angeles, CA',
      bio: [
        'LA', "WGU '28", 'Day In The Life', 'Video Editor',
        'Software Engineer Student', 'Cybersecurity Graduate',
        'NXT-G3NERATION', 'DevRel', 'Co-L4B', 'ROCm Certified',
      ],
      accent: '#FFD1DC', // powder pink
      avatar: 'assets/Profile.jpg',
      email: 'tjxshihouin@gmail.com',
      links: [
        { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/tjxshihouin', icon: 'IG' },
        { id: 'tiktok',    label: 'TikTok',    url: 'https://www.tiktok.com/@tjxshihouin1',      icon: 'TT' },
        { id: 'x',         label: 'X',         url: 'https://x.com/TJxSHIIHOUIN',                 icon: 'X'  },
        { id: 'linkedin',  label: 'LinkedIn',  url: 'https://www.linkedin.com/in/tyshawn-hill-1935262b2/', icon: 'IN' },
        { id: 'youtube',   label: 'YouTube',   url: 'https://www.youtube.com/@TJxSHIHOUIN',      icon: 'YT' },
        { id: 'patreon',   label: 'Patreon',   url: 'https://www.patreon.com/NXTG3NERATION',      icon: 'P'  },
        { id: 'twitch',    label: 'Twitch',    url: 'https://www.twitch.tv/tjxshihouin',           icon: 'TV' },
        { id: 'email',     label: 'Email',     url: 'mailto:tjxshihouin@gmail.com',               icon: '@'  },
      ],
    },

    /* ---- Categories (shown as a left/right carousel) ---- */
    categories: [
      {
        id: 'content',
        name: 'Content · Developer Relations',
        items: [
          { name: 'Adobe', note: 'Creative Suite' },
          { name: 'Final Cut Pro', note: 'Video Editing' },
          { name: 'Logic Pro', note: 'Audio & Music' },
        ],
      },
      {
        id: 'gamedev',
        name: 'Game Development',
        items: [
          { name: 'Unreal Engine', note: 'Game Development' },
          { name: 'Roblox Studio', note: 'Game Development' },
          { name: 'Blender', note: '3D Modeling & Animation' },
        ],
      },
      {
        id: 'fullstack',
        name: 'Fullstack',
        items: [
          { name: 'PyCharm', note: 'Python IDE' },
          { name: 'VS Code', note: 'Code Editor' },
          { name: 'IntelliJ IDEA', note: 'Java IDE' },
          { name: 'WebStorm', note: 'Web IDE' },
          { name: 'Xcode', note: 'iOS / macOS' },
          { name: 'GitHub', note: 'Version Control' },
          { name: 'MongoDB', note: 'Database' },
          { name: 'Notion', note: 'Docs & Planning' },
        ],
      },
      {
        id: 'ai',
        name: 'AI/ML',
        items: [
          { name: 'ROCm', note: 'GPU Compute' },
          { name: 'CUDA', note: 'GPU Compute' },
          { name: 'PyTorch', note: 'ML Framework' },
          { name: 'Ollama', note: 'Local LLMs' },
          { name: 'Kimi', note: 'AI Model' },
          { name: 'DeepSeek', note: 'AI Model' },
          { name: 'Nemotron', note: 'AI Model' },
        ],
      },
      {
        id: 'fun',
        name: 'Projects',
        items: [
          { name: '343 Guilty Spark', desc: 'Half-scale replica of 343 Guilty Spark from the original Halo — real titanium, a Jetson Mini, and software I wrote for it.' },
          { name: 'Co-L4B', desc: 'My agentic coding workspace — keeps context on-device and brings frontier + local AI together in one place.' },
          { name: 'X3', desc: 'Local models I\'m building — MoE coders and assistants.' },
          { name: 'A.L.I.T.A', desc: 'My personal AI assistant.' },
          { name: 'Portfolio', desc: 'This site — the ASCII portfolio you\'re looking at right now.' },
          { name: 'NXT-G3NERATION', desc: 'I\'m Developer Relations for NXT-G3NERATION.' },
        ],
      },
      {
        id: 'events',
        name: 'Events',
        items: [
          { name: 'Boxworks Summit', note: 'San Francisco · California' },
          { name: 'WeAreDevelopers', note: 'San Jose · California' },
          { name: 'Halo Fest 2026', note: 'Seattle · Washington' },
          { name: 'GitHub Universe', note: 'San Francisco · California' },
          { name: 'AMD AI Dev Day', note: 'Austin · Texas' },
          { name: 'Vapicon', note: 'San Francisco · California' },
          { name: 'NXT-G3N:NOW', note: 'San Francisco · California · 2027' },
        ],
      },
      {
        id: 'travel',
        name: 'Travel',
        items: [
          { name: 'Texas', note: 'Austin · Houston · Dallas' },
          { name: 'Washington', note: 'Seattle' },
          { name: 'Canada', note: 'Vancouver' },
          { name: 'California', note: 'Los Angeles · San Francisco · San Jose' },
          { name: 'Nevada', note: 'Las Vegas' },
          { name: 'New York', note: 'New York' },
          { name: 'North Carolina', note: 'Raleigh' },
        ],
      },
      {
        id: 'edc',
        name: 'Everyday Carry',
        items: [
          { name: 'iPhone Air', note: 'Phone' },
          { name: 'iPhone 17 Pro Max', note: 'Phone' },
          { name: 'AirPods Pro 3', note: 'Earbuds' },
          { name: 'DJI Mic Mini ×4', note: 'Mic' },
          { name: 'DJI Mic 2', note: 'Mic' },
          { name: 'Nothing Headphones (a)', note: 'Audio' },
          { name: 'MacBook Pro M1 Max', note: 'Laptop · 32GB' },
          { name: 'MX Master 4', note: 'Mouse' },
          { name: 'Apple Watch SE', note: 'Watch' },
          { name: 'Rains Mini Tote', note: 'Bag' },
          { name: 'Rains Backpack', note: 'Bag' },
          { name: 'Dash0 × SwissDigital Backpack', note: 'Custom Bag' },
          { name: 'Entire Pen + Dev Journal', note: 'Carry' },
        ],
      },
    ],

    /* ---- VIDEOS — the ASCII reel (played in random order) ---- */
    projects: [
      {
        id: 'boxworks',
        title: 'BoxWorks Mini Vlog',
        kind: 'video',
        src: 'assets/BoxWorks Mini Vlog-web.mp4',
        blurb: 'Mini vlog from BoxWorks.',
        tags: ['Vlog', 'BoxWorks', 'NVIDIA'],
      },
      {
        id: 'datadog',
        title: 'Datadog Interview',
        kind: 'video',
        src: 'assets/Datadog- Interview-web.mp4',
        blurb: 'Interview at Datadog.',
        tags: ['Interview', 'Datadog'],
      },
      {
        id: 'humza-quinn',
        title: 'Humza Quinn Interview',
        kind: 'video',
        src: 'assets/Humza Quinn Interview-1-web.mp4',
        blurb: 'Interview with Humza Quinn.',
        tags: ['Interview'],
      },
      {
        id: 'sf-aws',
        title: 'San Francisco AWS Vlog',
        kind: 'video',
        src: 'assets/San Francisco AWS Vlog-web.mp4',
        blurb: 'Vlog from San Francisco AWS.',
        tags: ['AWS', 'SF', 'Vlog'],
      },
      {
        id: 'wad-sanjose',
        title: 'We Are Developers, San Jose',
        kind: 'video',
        src: 'assets/We Are Developers, San Jose Vlog-web.mp4',
        blurb: 'Vlog from We Are Developers, San Jose.',
        tags: ['Conference', 'Vlog', 'Dev'],
      },
    ],
  };
})();
