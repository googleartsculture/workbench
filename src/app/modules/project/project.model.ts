export interface ProjectListItem {
  author: string;
  created: number;
  id: string;
  title: string;
  updated: number;
}

export interface Project {
  created: number;
  id: string;
  properties: {
    author: string;
    title: string;
  };
  updated: number;
}

export interface ProjectAside {
  active: boolean;
  loaded: boolean;
}

export interface ProjectPanel {
  active: boolean;
  loaded: boolean;
}
