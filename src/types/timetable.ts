export interface Timetable {
  id: string;
  name: string;
  semester: string[];
  branch: string[];
  section: string[];
  fileName: string;
  fileUrl: string;
  year: string;
  showOnWebsite: boolean;
  createdAt: string;
}
