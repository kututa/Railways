import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Train, MapPin, Clock, Shield, Star, Users, ChevronRight } from "lucide-react";


export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden hero-section">
        {/* Background Image Slider */}
        <div className="absolute inset-0 z-0">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-0 w-full h-full opacity-100 animate-[slideShow_16s_infinite_0s]">
              <img 
                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
                alt="Modern train on railway tracks" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-0 left-0 w-full h-full opacity-0 animate-[slideShow_16s_infinite_4s]">
              <img 
                src="https://images.unsplash.com/photo-1474487548417-781cb71495f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
                alt="Railway station platform" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-0 left-0 w-full h-full opacity-0 animate-[slideShow_16s_infinite_8s]">
              <img 
                src="https://images.unsplash.com/photo-1569154941061-e231b4725ef1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
                alt="High-speed train in motion" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-0 left-0 w-full h-full opacity-0 animate-[slideShow_16s_infinite_12s]">
              <img 
                src="https://images.unsplash.com/photo-1517400508447-f8dd518b86db?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
                alt="Railway through scenic landscape" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6" style={{fontFamily: "'Orbitron', monospace"}}>
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">Journey with Comfort</span>
          </h1>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto font-light" style={{fontFamily: "'Orbitron', monospace"}}>
            Experience modern railway travel across Kenya. Book your tickets for Mombasa-Nairobi and Nairobi-Naivasha
            routes with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8 py-6" style={{fontFamily: "'Orbitron', monospace"}}>
              <Link href="/search">
                <Train className="mr-2 h-5 w-5" />
                Book Your Journey
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 bg-transparent backdrop-blur-sm border-white text-white hover:bg-white hover:text-black" style={{fontFamily: "'Orbitron', monospace"}}>
              <Link href="/routes">
                <MapPin className="mr-2 h-5 w-5" />
                View Routes
              </Link>
            </Button>
          </div>
        </div>
      </section>
      {/* end of hero section */}

      {/* Features Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">Why Choose Kututa Railway?</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Experience the future of rail travel with our cutting-edge services and unmatched commitment to excellence
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center group hover:scale-105 transition-all duration-300 hover:shadow-2xl bg-white/80 backdrop-blur-sm border-0 shadow-lg cursor-pointer">
              <CardHeader className="pb-4">
                <div className="relative">
                  <Clock className="h-14 w-14 text-blue-600 mx-auto mb-4 group-hover:text-blue-700 transition-colors duration-300 group-hover:scale-110 transform" />
                  <div className="absolute inset-0 bg-blue-600/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-500 opacity-0 group-hover:opacity-100"></div>
                </div>
                <CardTitle className="text-xl group-hover:text-blue-700 transition-colors duration-300">Punctual Service</CardTitle>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto mt-2 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  Our trains run on time, every time. Experience reliable transportation with precise scheduling and real-time updates.
                </CardDescription>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="inline-flex items-center text-sm text-blue-600 font-medium">
                    Learn more <ChevronRight className="h-4 w-4 ml-1" />
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center group hover:scale-105 transition-all duration-300 hover:shadow-2xl bg-white/80 backdrop-blur-sm border-0 shadow-lg cursor-pointer">
              <CardHeader className="pb-4">
                <div className="relative">
                  <Shield className="h-14 w-14 text-green-600 mx-auto mb-4 group-hover:text-green-700 transition-colors duration-300 group-hover:scale-110 transform" />
                  <div className="absolute inset-0 bg-green-600/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-500 opacity-0 group-hover:opacity-100"></div>
                </div>
                <CardTitle className="text-xl group-hover:text-green-700 transition-colors duration-300">Safe & Secure</CardTitle>
                <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto mt-2 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  Travel with confidence knowing our modern trains meet the highest safety standards and security protocols.
                </CardDescription>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="inline-flex items-center text-sm text-green-600 font-medium">
                    Learn more <ChevronRight className="h-4 w-4 ml-1" />
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center group hover:scale-105 transition-all duration-300 hover:shadow-2xl bg-white/80 backdrop-blur-sm border-0 shadow-lg cursor-pointer">
              <CardHeader className="pb-4">
                <div className="relative">
                  <Star className="h-14 w-14 text-amber-500 mx-auto mb-4 group-hover:text-amber-600 transition-colors duration-300 group-hover:scale-110 transform" />
                  <div className="absolute inset-0 bg-amber-500/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-500 opacity-0 group-hover:opacity-100"></div>
                </div>
                <CardTitle className="text-xl group-hover:text-amber-600 transition-colors duration-300">Premium Comfort</CardTitle>
                <div className="w-16 h-1 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto mt-2 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  Choose from Economy, First Class, or Business class for a comfortable journey tailored to your needs.
                </CardDescription>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="inline-flex items-center text-sm text-amber-600 font-medium">
                    Learn more <ChevronRight className="h-4 w-4 ml-1" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Routes Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Routes</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Train className="mr-2 h-5 w-5 text-blue-600" />
                  Mombasa ↔ Nairobi
                </CardTitle>
                <CardDescription>Madaraka Express</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="flex justify-between">
                    <span>Distance:</span>
                    <span className="font-semibold">485 km</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-semibold">8 hours</span>
                  </p>
                  <p className="flex justify-between">
                    <span>From:</span>
                    <span className="font-semibold text-green-600">KSh 1,212</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Train className="mr-2 h-5 w-5 text-blue-600" />
                  Nairobi ↔ Naivasha
                </CardTitle>
                <CardDescription>Naivasha Commuter</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="flex justify-between">
                    <span>Distance:</span>
                    <span className="font-semibold">90 km</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-semibold">2 hours</span>
                  </p>
                  <p className="flex justify-between">
                    <span>From:</span>
                    <span className="font-semibold text-green-600">KSh 162</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 railway-gradient text-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Users className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-3xl font-bold mb-2">50K+</h3>
              <p className="text-lg">Happy Passengers</p>
            </div>
            <div>
              <Train className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-3xl font-bold mb-2">99.5%</h3>
              <p className="text-lg">On-Time Performance</p>
            </div>
            <div>
              <MapPin className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-3xl font-bold mb-2">3</h3>
              <p className="text-lg">Major Routes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Train className="h-6 w-6" />
                <span className="text-xl font-bold">Kututa Railway</span>
              </div>
              <p className="text-gray-400">Modern railway transportation connecting Kenya's major cities.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/search" className="hover:text-white">
                    Book Tickets
                  </Link>
                </li>
                <li>
                  <Link href="/routes" className="hover:text-white">
                    Routes
                  </Link>
                </li>
                <li>
                  <Link href="/schedules" className="hover:text-white">
                    Schedules
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <p>📞 +254 700 123 456</p>
                <p>✉️ info@kututa.com</p>
                <p>📍 Nairobi, Kenya</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Kututa Railway Company. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
