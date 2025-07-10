import { useState, useEffect } from "react"

interface LikeFavoriteState {
  likedQuotes: Set<string>
  favoritedQuotes: Set<string>
}

export function useLikesFavorites() {
  const [state, setState] = useState<LikeFavoriteState>({
    likedQuotes: new Set(),
    favoritedQuotes: new Set(),
  })

  // 从localStorage加载状态
  useEffect(() => {
    const savedLikes = localStorage.getItem("likedQuotes")
    const savedFavorites = localStorage.getItem("favoritedQuotes")
    
    if (savedLikes) {
      const likedQuotes = new Set(JSON.parse(savedLikes) as string[])
      setState(prev => ({ ...prev, likedQuotes }))
    }
    
    if (savedFavorites) {
      const favoritedQuotes = new Set(JSON.parse(savedFavorites) as string[])
      setState(prev => ({ ...prev, favoritedQuotes }))
    }
  }, [])

  // 保存状态到localStorage
  const saveToStorage = (newState: LikeFavoriteState) => {
    localStorage.setItem("likedQuotes", JSON.stringify([...newState.likedQuotes]))
    localStorage.setItem("favoritedQuotes", JSON.stringify([...newState.favoritedQuotes]))
  }

  const toggleLike = (quoteId: string) => {
    setState(prev => {
      const newLikedQuotes = new Set(prev.likedQuotes)
      if (newLikedQuotes.has(quoteId)) {
        newLikedQuotes.delete(quoteId)
      } else {
        newLikedQuotes.add(quoteId)
      }
      
      const newState = { ...prev, likedQuotes: newLikedQuotes }
      saveToStorage(newState)
      return newState
    })
  }

  const toggleFavorite = (quoteId: string) => {
    setState(prev => {
      const newFavoritedQuotes = new Set(prev.favoritedQuotes)
      if (newFavoritedQuotes.has(quoteId)) {
        newFavoritedQuotes.delete(quoteId)
      } else {
        newFavoritedQuotes.add(quoteId)
      }
      
      const newState = { ...prev, favoritedQuotes: newFavoritedQuotes }
      saveToStorage(newState)
      return newState
    })
  }

  const isLiked = (quoteId: string) => state.likedQuotes.has(quoteId)
  const isFavorited = (quoteId: string) => state.favoritedQuotes.has(quoteId)

  return {
    isLiked,
    isFavorited,
    toggleLike,
    toggleFavorite,
    likedCount: state.likedQuotes.size,
    favoritedCount: state.favoritedQuotes.size,
  }
} 