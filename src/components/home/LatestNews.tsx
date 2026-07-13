import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBlogPosts, type BlogPost } from '../../services/blog'

export function LatestNews() {
  const [posts, setPosts] = useState<BlogPost[]>([])

  useEffect(() => {
    getBlogPosts()
      .then((data) => setPosts(data.slice(0, 5)))
      .catch(() => setPosts([]))
  }, [])

  return (
    <div className="home-news-list">
      {posts.map((post) => (
        <Link to={`/blog/${post.slug}`} key={post.id} data-reveal data-reveal-delay="0.1">
          <img src={post.image} alt="" />
          <span>{post.title}</span>
          <small>
            Leer más <ArrowRight size={12} />
          </small>
        </Link>
      ))}
    </div>
  )
}
