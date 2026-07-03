import { Link } from 'react-router-dom'
export function Logo({ light = false }: { light?: boolean }) { return <Link className={`logo${light ? ' logo-light' : ''}`} to="/" aria-label="Nexo, página de inicio"><span>n</span>nexo<small>formación</small></Link> }
