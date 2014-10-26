require 'json'
require 'date'
require 'open-uri'

# Summarizes the bridges by transport
class Summarize
  def initialize(data)
    @data = JSON.parse(data)
  end

  # Generate summary data of what is blocked by date
  def summarize
    byTransport = JSON.parse(groupByTransport)

    summaryhash = Hash.new
    byTransport.each do |country, transports|
      summaryhash[country] = Hash.new

      # For each transport in each country, group by date
      transports.each do |transportName, bridges|
        dates = groupByDate(bridges)
        summaryhash[country][transportName] = Array.new
        
        # Check how many of the transport type are blocked on each date
        dates.each do |date, measurements|
          flag = 0
          measurements.each do |m|
            flag += 1 if !m["success"]
          end

          # Set color based on what is blocked
          color = "green"
          if flag == measurements.size
            color = "red"
          elsif flag > 0
            color = "orange"
          end

          summaryhash[country][transportName].push({date => color})
        end
      end
    end
    return JSON.pretty_generate(summaryhash)
  end

  # Groups bridges and measurements by measurement date
  def groupByDate(bridges)
    datehash = Hash.new

    bridges.each do |ips|
      ips.values.each do |measurements|
        measurements.each do |m|
          time = Date.strptime(m["start_time"].to_s, '%s')
          
          datehash[time] ? datehash[time].push(m) : datehash[time] = [m]
        end
      end
    end

    return datehash
  end

  # Groups bridges by transport
  def groupByTransport
    outhash = Hash.new
    @data.each do |country, bridges|
      transporthash = Hash.new
      bridges.each do |ip, measurements|
        transport = measurements[0]["transport_name"]
        bridgehash = Hash.new
        bridgehash[ip] = measurements

        transporthash[transport] ? transporthash[transport].push(bridgehash) : transporthash[transport] = [bridgehash]
      end

      outhash[country] = transporthash
    end

    return JSON.pretty_generate(outhash)
  end
end

file = File.read(open("http://reports.ooni.nu/bridges-by-country-code.json"))
g = Summarize.new(file)
File.write("grouped.json", g.groupByTransport)

s = Summarize.new(file)
File.write("summarized.json", s.summarize)
