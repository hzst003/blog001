export type ExperienceItem = {
  period: string;
  role: string;
  company: string;
  description: string;
};

export const aboutConfig = {
  title: "",
  description: "",
  image: "/assets/images/about.jpg",
  stats: [] as string[],
  skills: [] as string[],
  experience: {
    title: "",
    items: [] as ExperienceItem[],
  },
  connect: {
    title: "",
    description: "",
    links: {
      twitter: {
        text: "",
        url: "",
      },
      email: {
        text: "",
        url: "",
      },
    },
  },
};
