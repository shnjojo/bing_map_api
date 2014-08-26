require 'sinatra'
require 'json'

get '/' do
  File.read(File.join('public', 'sample.html'))
end

get '/map' do
  content_type :json
  {
    title: 'Sherlock\'s home',
    address: 'Baker Street 221b'
  }.to_json
end

post '/map' do
  # New hash for places
  @ryan = Hash.new
  @will = Hash.new
  @leo = Hash.new
  @sergey = Hash.new
  @john = Hash.new
  @places = Array.new
  
  # Bound from client
  @json = JSON.parse(request.body.read)
  @json.to_h
  @north_west = @json["north_west"]
  @south_east = @json["south_east"]

  # Set the data for return
  @ryan["id"] = "1"
  @ryan["name"] = "Ryan's Home"
  @ryan["address"] = "Under the bridge"
  @ryan["type"] = "blue"
  @ryan["pic"] = ""
  @ryan["location"] = {latitude: "52.4671044", longitude: "-1.9045764"}
  
  @will["id"] = "2"
  @will["name"] = "Will's Home"
  @will["address"] = "Under the ground"
  @will["type"] = "blue"
  @will["pic"] = ""
  @will["location"] = {latitude: "52.4681044", longitude: "-1.9035764"}
  
  @leo["id"] = "3"
  @leo["name"] = "Leo's Home"
  @leo["address"] = "Homeless"
  @leo["type"] = "blue"
  @leo["pic"] = ""
  @leo["location"] = {latitude: "52.4691044", longitude: "-1.9025764"}
  
  @sergey["id"] = "4"
  @sergey["name"] = "Sergey's Home"
  @sergey["address"] = "With John"
  @sergey["type"] = "blue"
  @sergey["pic"] = ""
  @sergey["location"] = {latitude: "52.4701044", longitude: "-1.9015764"}
  
  @john["id"] = "5"
  @john["name"] = "John's Home"
  @john["address"] = "With Sergey"
  @john["type"] = "red"
  @john["pic"] = "pic.jpg"
  @john["location"] = {latitude: "52.4711044", longitude: "-1.9005764"}
  
  @places.push(@ryan)
  @places.push(@will)
  @places.push(@leo)
  @places.push(@sergey)
  @places.push(@john)
  
  print @places
  
  content_type :json
  @places.to_json
end

post '/map/init' do
  
  @json = JSON.parse(request.body.read)
  @json.to_h
  content_type :json
  @places.to_json
end