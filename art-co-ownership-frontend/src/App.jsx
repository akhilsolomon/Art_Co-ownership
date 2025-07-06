import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx'
import { 
  Palette, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Wallet, 
  Star, 
  Eye, 
  Share2, 
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  User,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { AuthClient } from '@dfinity/auth-client'
import { Actor, HttpAgent } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'
import './App.css'

// Mock data for development - replace with actual ICP backend calls
const mockArtPieces = [
  {
    id: 1,
    title: "Digital Renaissance",
    artist: "CryptoArtist",
    description: "A stunning digital artwork representing the fusion of classical art with blockchain technology.",
    image_url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800",
    total_tokens: 1000,
    price_per_token: 100000, // 0.001 ICP
    created_at: Date.now(),
    creator: "anonymous",
    verified: true,
    tokens_sold: 650,
    owners: 23
  },
  {
    id: 2,
    title: "Neon Dreams",
    artist: "DigitalVision",
    description: "Vibrant neon-inspired artwork exploring the intersection of technology and human emotion.",
    image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
    total_tokens: 500,
    price_per_token: 200000, // 0.002 ICP
    created_at: Date.now() - 86400000,
    creator: "anonymous",
    verified: true,
    tokens_sold: 320,
    owners: 15
  },
  {
    id: 3,
    title: "Abstract Harmony",
    artist: "ModernMaster",
    description: "An exploration of color, form, and digital expression in the modern age.",
    image_url: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800",
    total_tokens: 750,
    price_per_token: 150000, // 0.0015 ICP
    created_at: Date.now() - 172800000,
    creator: "anonymous",
    verified: false,
    tokens_sold: 180,
    owners: 8
  }
]

const mockUserProfile = {
  principal: "anonymous",
  username: "ArtLover123",
  email: "artlover@example.com",
  created_at: Date.now() - 2592000000,
  total_investments: 500000,
  verified: true
}

const mockUserTokens = [
  {
    art_id: 1,
    owner: "anonymous",
    tokens_owned: 50,
    purchase_price: 5000000,
    purchase_date: Date.now() - 86400000
  },
  {
    art_id: 2,
    owner: "anonymous",
    tokens_owned: 25,
    purchase_price: 5000000,
    purchase_date: Date.now() - 172800000
  }
]

const mockTradeOffers = [
  {
    id: 1,
    art_id: 1,
    seller: "seller1",
    tokens_for_sale: 10,
    price_per_token: 110000,
    created_at: Date.now() - 3600000,
    active: true
  },
  {
    id: 2,
    art_id: 2,
    seller: "seller2",
    tokens_for_sale: 5,
    price_per_token: 220000,
    created_at: Date.now() - 7200000,
    active: true
  }
]

// Navigation Component
function Navigation({ user, onLogin, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Palette className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">ArtShare</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link to="/" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Discover
              </Link>
              <Link to="/marketplace" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Marketplace
              </Link>
              <Link to="/portfolio" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Portfolio
              </Link>
              <Link to="/create" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Create
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  {(user.total_investments / 100000000).toFixed(3)} ICP
                </Badge>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" onClick={onLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button onClick={onLogin}>
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900">
                Discover
              </Link>
              <Link to="/marketplace" className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900">
                Marketplace
              </Link>
              <Link to="/portfolio" className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900">
                Portfolio
              </Link>
              <Link to="/create" className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900">
                Create
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

// Art Card Component
function ArtCard({ art, onPurchase, onViewDetails }) {
  const tokensAvailable = art.total_tokens - art.tokens_sold
  const completionPercentage = (art.tokens_sold / art.total_tokens) * 100

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img 
          src={art.image_url} 
          alt={art.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          {art.verified && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </div>
      
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{art.title}</CardTitle>
            <CardDescription>by {art.artist}</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">
              {(art.price_per_token / 100000000).toFixed(4)} ICP
            </div>
            <div className="text-xs text-gray-500">per token</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{art.description}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{art.tokens_sold}/{art.total_tokens} tokens</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          
          <div className="flex justify-between text-sm text-gray-500">
            <span className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {art.owners} owners
            </span>
            <span>{tokensAvailable} available</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex space-x-2">
        <Button variant="outline" size="sm" onClick={() => onViewDetails(art)} className="flex-1">
          <Eye className="h-4 w-4 mr-2" />
          Details
        </Button>
        <Button size="sm" onClick={() => onPurchase(art)} className="flex-1">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Buy Tokens
        </Button>
      </CardFooter>
    </Card>
  )
}

// Purchase Dialog Component
function PurchaseDialog({ art, isOpen, onClose, onConfirm }) {
  const [tokenAmount, setTokenAmount] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  
  if (!art) return null
  
  const totalCost = tokenAmount * art.price_per_token
  const tokensAvailable = art.total_tokens - art.tokens_sold

  const handlePurchase = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    onConfirm(art.id, tokenAmount)
    setIsLoading(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase Tokens</DialogTitle>
          <DialogDescription>
            Buy fractional ownership tokens for "{art.title}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <img 
              src={art.image_url} 
              alt={art.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <h4 className="font-medium">{art.title}</h4>
              <p className="text-sm text-gray-500">by {art.artist}</p>
              <p className="text-sm">
                {(art.price_per_token / 100000000).toFixed(4)} ICP per token
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tokens">Number of tokens</Label>
            <Input
              id="tokens"
              type="number"
              min="1"
              max={tokensAvailable}
              value={tokenAmount}
              onChange={(e) => setTokenAmount(Math.max(1, Math.min(tokensAvailable, parseInt(e.target.value) || 1)))}
            />
            <p className="text-xs text-gray-500">
              Available: {tokensAvailable} tokens
            </p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Cost:</span>
              <span className="font-bold">
                {(totalCost / 100000000).toFixed(6)} ICP
              </span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Ownership:</span>
              <span>{((tokenAmount / art.total_tokens) * 100).toFixed(2)}%</span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handlePurchase} disabled={isLoading}>
            {isLoading ? "Processing..." : "Purchase Tokens"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Art Details Dialog Component
function ArtDetailsDialog({ art, isOpen, onClose, onPurchase }) {
  if (!art) return null
  
  const completionPercentage = (art.tokens_sold / art.total_tokens) * 100

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{art.title}</DialogTitle>
          <DialogDescription>by {art.artist}</DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <img 
              src={art.image_url} 
              alt={art.title}
              className="w-full rounded-lg object-cover"
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-gray-600">{art.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Price per Token</h4>
                <p className="text-lg font-bold">
                  {(art.price_per_token / 100000000).toFixed(4)} ICP
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Total Tokens</h4>
                <p className="text-lg font-bold">{art.total_tokens.toLocaleString()}</p>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Ownership Progress</h4>
                <span className="text-sm text-gray-500">
                  {art.tokens_sold}/{art.total_tokens}
                </span>
              </div>
              <Progress value={completionPercentage} className="h-3" />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>{completionPercentage.toFixed(1)}% sold</span>
                <span>{art.owners} owners</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {art.verified && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {new Date(art.created_at).toLocaleDateString()}
              </Badge>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={() => onPurchase(art)}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Buy Tokens
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Home Page Component
function HomePage({ onPurchase, onViewDetails }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  
  const filteredArt = mockArtPieces
    .filter(art => 
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.artist.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price_per_token - b.price_per_token
        case 'price-high': return b.price_per_token - a.price_per_token
        case 'popular': return b.owners - a.owners
        default: return b.created_at - a.created_at
      }
    })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Discover & Own Fractional Art
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Democratizing art ownership through blockchain technology. 
          Buy, sell, and trade fractional ownership in premium artworks.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3">
              <Palette className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium mb-1">Curated Art</h3>
            <p className="text-sm text-gray-500">Premium digital artworks from verified artists</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-medium mb-1">Fractional Ownership</h3>
            <p className="text-sm text-gray-500">Own a piece of valuable art with any budget</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-medium mb-1">Trade & Profit</h3>
            <p className="text-sm text-gray-500">Buy and sell tokens as art values appreciate</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search artworks or artists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">Newest First</option>
          <option value="popular">Most Popular</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      {/* Art Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArt.map(art => (
          <ArtCard
            key={art.id}
            art={art}
            onPurchase={onPurchase}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  )
}

// Portfolio Page Component
function PortfolioPage({ user }) {
  const [activeTab, setActiveTab] = useState('holdings')
  
  const totalValue = mockUserTokens.reduce((sum, token) => {
    const art = mockArtPieces.find(a => a.id === token.art_id)
    return sum + (token.tokens_owned * (art?.price_per_token || 0))
  }, 0)
  
  const totalInvested = mockUserTokens.reduce((sum, token) => sum + token.purchase_price, 0)
  const profitLoss = totalValue - totalInvested

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio</h1>
        <p className="text-gray-600">Manage your art investments and track performance</p>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalValue / 100000000).toFixed(4)} ICP
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Invested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalInvested / 100000000).toFixed(4)} ICP
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {profitLoss >= 0 ? '+' : ''}{(profitLoss / 100000000).toFixed(4)} ICP
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Artworks Owned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUserTokens.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="offers">Trade Offers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="holdings" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockUserTokens.map(token => {
              const art = mockArtPieces.find(a => a.id === token.art_id)
              if (!art) return null
              
              const currentValue = token.tokens_owned * art.price_per_token
              const profitLoss = currentValue - token.purchase_price
              const ownershipPercentage = (token.tokens_owned / art.total_tokens) * 100

              return (
                <Card key={token.art_id}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <img 
                        src={art.image_url} 
                        alt={art.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{art.title}</h3>
                        <p className="text-gray-500 text-sm">by {art.artist}</p>
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-gray-500">Tokens Owned</p>
                            <p className="font-medium">{token.tokens_owned}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Ownership</p>
                            <p className="font-medium">{ownershipPercentage.toFixed(2)}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Current Value</p>
                            <p className="font-medium">{(currentValue / 100000000).toFixed(4)} ICP</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">P&L</p>
                            <p className={`font-medium ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {profitLoss >= 0 ? '+' : ''}{(profitLoss / 100000000).toFixed(4)} ICP
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 mt-4">
                          <Button size="sm" variant="outline">
                            <Share2 className="h-3 w-3 mr-1" />
                            Sell
                          </Button>
                          <Button size="sm" variant="outline">
                            <Plus className="h-3 w-3 mr-1" />
                            Buy More
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockUserTokens.map(token => {
                  const art = mockArtPieces.find(a => a.id === token.art_id)
                  return (
                    <div key={token.art_id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 rounded-full p-2">
                          <ShoppingCart className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Purchased {token.tokens_owned} tokens</p>
                          <p className="text-sm text-gray-500">{art?.title}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{(token.purchase_price / 100000000).toFixed(4)} ICP</p>
                        <p className="text-sm text-gray-500">
                          {new Date(token.purchase_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="offers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Trade Offers</CardTitle>
              <CardDescription>
                Current offers to buy tokens from other users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTradeOffers.map(offer => {
                  const art = mockArtPieces.find(a => a.id === offer.art_id)
                  return (
                    <div key={offer.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={art?.image_url} 
                          alt={art?.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium">{art?.title}</p>
                          <p className="text-sm text-gray-500">
                            {offer.tokens_for_sale} tokens at {(offer.price_per_token / 100000000).toFixed(4)} ICP each
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {(offer.tokens_for_sale * offer.price_per_token / 100000000).toFixed(4)} ICP
                        </Badge>
                        <Button size="sm">Accept Offer</Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Create Art Page Component
function CreateArtPage() {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    description: '',
    image_url: '',
    total_tokens: 1000,
    price_per_token: 100000
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    alert('Art piece created successfully! It will be reviewed before being listed.')
    setFormData({
      title: '',
      artist: '',
      description: '',
      image_url: '',
      total_tokens: 1000,
      price_per_token: 100000
    })
    setIsSubmitting(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Art Piece</h1>
        <p className="text-gray-600">Tokenize your artwork and enable fractional ownership</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Art Details</CardTitle>
          <CardDescription>
            Provide information about your artwork to create tokenized ownership
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Enter artwork title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="artist">Artist Name</Label>
              <Input
                id="artist"
                value={formData.artist}
                onChange={(e) => setFormData({...formData, artist: e.target.value})}
                placeholder="Enter artist name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe your artwork..."
                rows={4}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_tokens">Total Tokens</Label>
                <Input
                  id="total_tokens"
                  type="number"
                  min="1"
                  value={formData.total_tokens}
                  onChange={(e) => setFormData({...formData, total_tokens: parseInt(e.target.value) || 1})}
                  required
                />
                <p className="text-xs text-gray-500">
                  Number of ownership tokens to create
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price_per_token">Price per Token (e8s)</Label>
                <Input
                  id="price_per_token"
                  type="number"
                  min="1"
                  value={formData.price_per_token}
                  onChange={(e) => setFormData({...formData, price_per_token: parseInt(e.target.value) || 1})}
                  required
                />
                <p className="text-xs text-gray-500">
                  Price in e8s (1 ICP = 100,000,000 e8s)
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Tokens:</span>
                  <span>{formData.total_tokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price per Token:</span>
                  <span>{(formData.price_per_token / 100000000).toFixed(6)} ICP</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total Value:</span>
                  <span>{((formData.total_tokens * formData.price_per_token) / 100000000).toFixed(4)} ICP</span>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Creating..." : "Create Art Piece"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

// Main App Component
function App() {
  const [user, setUser] = useState(mockUserProfile)
  const [selectedArt, setSelectedArt] = useState(null)
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const handleLogin = async () => {
    // In a real app, this would use Internet Identity
    setUser(mockUserProfile)
  }

  const handleLogout = () => {
    setUser(null)
  }

  const handlePurchase = (art) => {
    if (!user) {
      alert('Please connect your wallet first')
      return
    }
    setSelectedArt(art)
    setShowPurchaseDialog(true)
  }

  const handleViewDetails = (art) => {
    setSelectedArt(art)
    setShowDetailsDialog(true)
  }

  const handlePurchaseConfirm = (artId, tokenAmount) => {
    alert(`Successfully purchased ${tokenAmount} tokens!`)
    // In a real app, this would update the backend and refresh data
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation user={user} onLogin={handleLogin} onLogout={handleLogout} />
        
        <Routes>
          <Route 
            path="/" 
            element={
              <HomePage 
                onPurchase={handlePurchase}
                onViewDetails={handleViewDetails}
              />
            } 
          />
          <Route 
            path="/marketplace" 
            element={
              <HomePage 
                onPurchase={handlePurchase}
                onViewDetails={handleViewDetails}
              />
            } 
          />
          <Route 
            path="/portfolio" 
            element={<PortfolioPage user={user} />} 
          />
          <Route 
            path="/create" 
            element={<CreateArtPage />} 
          />
        </Routes>

        <PurchaseDialog
          art={selectedArt}
          isOpen={showPurchaseDialog}
          onClose={() => setShowPurchaseDialog(false)}
          onConfirm={handlePurchaseConfirm}
        />

        <ArtDetailsDialog
          art={selectedArt}
          isOpen={showDetailsDialog}
          onClose={() => setShowDetailsDialog(false)}
          onPurchase={handlePurchase}
        />
      </div>
    </Router>
  )
}

export default App

