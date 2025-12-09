interface AvatarProps {
  src?: string
  alt: string
}

export const Avatar = ({ src, alt }: AvatarProps) => (
  <img 
    className="w-12 h-12 rounded-full object-cover border-2 border-surface shadow-sm" 
    src={src ?? 'https://placehold.co/96x96'} 
    alt={alt} 
  />
)
