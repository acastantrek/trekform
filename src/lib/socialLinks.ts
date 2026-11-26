import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  XIcon,
  YoutubeIcon,
} from '../components/common/SocialIcons'

// Trekform's social profiles, shared by the footer and the end of every blog article.
export const socialLinks = [
  { label: 'X (Twitter)', href: 'https://twitter.com/Trekform2', Icon: XIcon },
  { label: 'Facebook', href: 'https://www.facebook.com/trek.form', Icon: FacebookIcon },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/trekform/', Icon: LinkedinIcon },
  { label: 'Instagram', href: 'https://www.instagram.com/trekform', Icon: InstagramIcon },
  { label: 'YouTube', href: 'https://www.youtube.com/@trekform938', Icon: YoutubeIcon },
] as const
