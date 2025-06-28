interface ActivityInfo {
  title: string;
  time: string;
  location: string;
  tags: string[];
  creator_name?: string;
  id?: number;
  description? : string;
  creator_id?: string;
}

export default ActivityInfo