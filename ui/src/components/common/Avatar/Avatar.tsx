import styles from './Avatar.module.css'

interface AvatarProps {
  src?: string
  alt: string
}

export const Avatar = ({ src, alt }: AvatarProps) => (
  <img className={styles.avatar} src={src ?? 'https://placehold.co/96x96'} alt={alt} />
)
