// src/pages/Dashboard.js
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as d3 from "d3";
import Layout from "../components/Layout";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const d3ContainerRef1 = useRef(null);
  const d3ContainerRef2 = useRef(null);
  const d3ContainerRef3 = useRef(null);
  const [barValue, setBarValue] = useState(0);
  const [repoName, setRepoName] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    // Get userInput from navigation state
    if (location.state && location.state.userInput) {
      setUserInput(location.state.userInput);
      handleGenerateReport(location.state.userInput);
    } else {
      // If no userInput, navigate back to Home
      navigate("/");
    }
  }, [location, navigate]);

  const handleResize = () => {
    setIsLargeScreen(window.innerWidth >= 765);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize(); // Set initial screen size state
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleGenerateReport = async (input) => {
    setStatus("Running Python script...");
    try {
      const response = await fetch(`/run?link=${encodeURIComponent(input)}`);
      const data = await response.json();
      if (data.status === "ready") {
        setStatus("Files are ready. Loading content...");
        setRepoName(data.repo_name);
        // Load D3 visualizations
        loadVisualizations();
      } else {
        setStatus("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error:", error);
      setStatus("Failed to run Python script");
    }
  };

  const loadVisualizations = () => {
    // Load and render the D3 visualization for Actual Graph
    if (d3ContainerRef1.current) {
      d3.json("/api/Actual-Graph").then(function (data) {
        let width = 500;
        let height = 400;

        let nodes = data.nodes;
        let links = data.links;

        // Create SVG
        const svg = d3
          .select(d3ContainerRef1.current)
          .attr("width", width)
          .attr("height", height);

        // Create a group for the graph elements
        const g = svg.append("g");

        // Define zoom behavior
        const zoom = d3.zoom().scaleExtent([0.1, 10]).on("zoom", zoomed);

        // Apply zoom behavior to the SVG
        svg.call(zoom);

        // Set initial zoom transform
        const initialScale = 0.3; // Adjusted scale
        const initialTranslateX = 200; // Adjusted translation X
        const initialTranslateY = 200; // Adjusted translation Y

        svg.call(
          zoom.transform,
          d3.zoomIdentity
            .translate(initialTranslateX, initialTranslateY)
            .scale(initialScale)
        );

        function zoomed(event) {
          g.attr("transform", event.transform);
        }

        // Set up force simulation
        const simulation = d3
          .forceSimulation(nodes)
          .force(
            "link",
            d3
              .forceLink(links)
              .id((d) => d.id)
              .distance(100)
          )
          .force("charge", d3.forceManyBody().strength(-100))
          .force("center", d3.forceCenter(width / 2, height / 2))
          .force("collision", d3.forceCollide().radius(50));

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        // Add links to the group
        const link = g
          .append("g")
          .attr("class", "links")
          .selectAll("line")
          .data(links)
          .enter()
          .append("line")
          .style("stroke", "#16171b")
          .style("stroke-opacity", 0.6)
          .style("stroke-width", 1.5);

        // Add nodes to the group
        const node = g
          .append("g")
          .attr("class", "nodes")
          .selectAll("circle")
          .data(nodes)
          .enter()
          .append("circle")
          .attr("r", 10)
          .attr("fill", (d) => color(d.group))
          .style("stroke", "#fff")
          .style("stroke-width", 1.5)
          .call(
            d3
              .drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended)
          );

        // Add a title element to display node IDs on hover
        node.append("title").text((d) => d.id);

        // Count the number of links for each node
        nodes.forEach((d) => {
          d.linkCount = links.filter(
            (l) => l.source.id === d.id || l.target.id === d.id
          ).length;
        });

        // Highlight connected nodes and links on hover
        node
          .on("mouseover", function (event, d) {
            node.style("opacity", (o) => (isConnected(d, o) ? 1 : 0));
            link.style("stroke-opacity", (o) =>
              o.source === d || o.target === d ? 1 : 0
            );
          })
          .on("mouseout", function () {
            node.style("opacity", 1);
            link.style("stroke-opacity", 0.6);
          });

        simulation.nodes(nodes).on("tick", ticked);
        simulation.force("link").links(links);

        function ticked() {
          link
            .attr("x1", (d) => d.source.x)
            .attr("y1", (d) => d.source.y)
            .attr("x2", (d) => d.target.x)
            .attr("y2", (d) => d.target.y);

          node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
        }

        function dragstarted(event, d) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        }

        function dragged(event, d) {
          d.fx = event.x;
          d.fy = event.y;
        }

        function dragended(event, d) {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }

        function isConnected(a, b) {
          return (
            links.some(
              (l) =>
                (l.source === a && l.target === b) ||
                (l.source === b && l.target === a)
            ) || a === b
          );
        }
      });
    }
    // Load and render the D3 visualization for Requirements Graph
    if (d3ContainerRef2.current) {
      d3.json("/api/Requirements-Graph").then(function (data) {
        let width = 500;
        let height = 400;

        let nodes = data.nodes;
        let links = data.links;

        // Create SVG
        const svg = d3
          .select(d3ContainerRef2.current)
          .attr("width", width)
          .attr("height", height);

        // Create a group for the graph elements
        const g = svg.append("g");

        // Define zoom behavior
        const zoom = d3.zoom().scaleExtent([0.1, 10]).on("zoom", zoomed);

        // Apply zoom behavior to the SVG
        svg.call(zoom);

        // Set initial zoom transform
        const initialScale = 0.3; // Adjusted scale
        const initialTranslateX = 200; // Adjusted translation X
        const initialTranslateY = 200; // Adjusted translation Y

        svg.call(
          zoom.transform,
          d3.zoomIdentity
            .translate(initialTranslateX, initialTranslateY)
            .scale(initialScale)
        );

        function zoomed(event) {
          g.attr("transform", event.transform);
        }

        // Set up force simulation
        const simulation = d3
          .forceSimulation(nodes)
          .force(
            "link",
            d3
              .forceLink(links)
              .id((d) => d.id)
              .distance(100)
          )
          .force("charge", d3.forceManyBody().strength(-100))
          .force("center", d3.forceCenter(width / 2, height / 2))
          .force("collision", d3.forceCollide().radius(50));

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        // Add links to the group
        const link = g
          .append("g")
          .attr("class", "links")
          .selectAll("line")
          .data(links)
          .enter()
          .append("line")
          .style("stroke", "#16171b")
          .style("stroke-opacity", 0.6)
          .style("stroke-width", 1.5);

        // Add nodes to the group
        const node = g
          .append("g")
          .attr("class", "nodes")
          .selectAll("circle")
          .data(nodes)
          .enter()
          .append("circle")
          .attr("r", 10)
          .attr("fill", (d) => color(d.group))
          .style("stroke", "#fff")
          .style("stroke-width", 1.5)
          .call(
            d3
              .drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended)
          );

        // Add a title element to display node IDs on hover
        node.append("title").text((d) => d.id);

        // Count the number of links for each node
        nodes.forEach((d) => {
          d.linkCount = links.filter(
            (l) => l.source.id === d.id || l.target.id === d.id
          ).length;
        });

        // Highlight connected nodes and links on hover
        node
          .on("mouseover", function (event, d) {
            node.style("opacity", (o) => (isConnected(d, o) ? 1 : 0));
            link.style("stroke-opacity", (o) =>
              o.source === d || o.target === d ? 1 : 0
            );
          })
          .on("mouseout", function () {
            node.style("opacity", 1);
            link.style("stroke-opacity", 0.6);
          });

        simulation.nodes(nodes).on("tick", ticked);
        simulation.force("link").links(links);

        function ticked() {
          link
            .attr("x1", (d) => d.source.x)
            .attr("y1", (d) => d.source.y)
            .attr("x2", (d) => d.target.x)
            .attr("y2", (d) => d.target.y);

          node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
        }

        function dragstarted(event, d) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        }

        function dragged(event, d) {
          d.fx = event.x;
          d.fy = event.y;
        }

        function dragended(event, d) {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }

        function isConnected(a, b) {
          return (
            links.some(
              (l) =>
                (l.source === a && l.target === b) ||
                (l.source === b && l.target === a)
            ) || a === b
          );
        }
      });
    }

    if (d3ContainerRef3.current) {
      d3.json("/api/Bar-Graph-Data").then(function (data) {
        const barValue = data.value;
        setBarValue(barValue);

        const containerWidth =
          d3ContainerRef3.current.parentElement.clientWidth;
        const containerHeight = 200;

        // Clear any existing SVG elements
        d3.select(d3ContainerRef3.current).selectAll("*").remove();

        // Create SVG container
        const svg = d3
          .select(d3ContainerRef3.current)
          .attr("width", containerWidth)
          .attr("height", containerHeight);

        const margin = { top: 30, right: 40, bottom: 50, left: 60 };
        const width = containerWidth - margin.left - margin.right;
        const height = containerHeight - margin.top - margin.bottom;

        // Create scales
        const x = d3.scaleLinear().domain([0, 1]).range([0, width]);

        const y = d3
          .scaleBand()
          .domain(["Your Metric"]) // Replace with your actual metric name
          .range([0, height])
          .padding(0.4);

        const g = svg
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

        // X-axis
        const xAxis = d3.axisBottom(x).ticks(5).tickFormat(d3.format(".0%"));

        g.append("g")
          .attr("transform", `translate(0, ${height})`)
          .call(xAxis)
          .selectAll("text")
          .style("font-size", "12px");

        // X-axis label
        svg
          .append("text")
          .attr("x", margin.left + width / 2)
          .attr("y", containerHeight - 5)
          .attr("text-anchor", "middle")
          .text("Percentage")
          .style("font-size", "14px")
          .style("font-weight", "bold");

        // Y-axis
        const yAxis = d3.axisLeft(y);

        g.append("g").call(yAxis).selectAll("text").style("font-size", "12px");

        // Y-axis label
        svg
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("x", -containerHeight / 2)
          .attr("y", 15)
          .attr("text-anchor", "middle")
          .text("")
          .style("font-size", "14px")
          .style("font-weight", "bold");

        // Title
        svg
          .append("text")
          .attr("x", margin.left + width / 2)
          .attr("y", 20)
          .attr("text-anchor", "middle")
          .text("Title") // Replace with your actual title
          .style("font-size", "16px")
          .style("font-weight", "bold");

        // Background bar (full scale)
        g.append("rect")
          .attr("x", x(0))
          .attr("y", y("Your Metric"))
          .attr("width", x(1))
          .attr("height", y.bandwidth())
          .style("fill", "#e5e7eb"); // Tailwind's gray-200

        // Actual value bar
        g.append("rect")
          .attr("x", x(0))
          .attr("y", y("Your Metric"))
          .attr("width", x(barValue))
          .attr("height", y.bandwidth())
          .style("fill", "#3b82f6"); // Tailwind's blue-500

        // Add percentage label inside the bar
        g.append("text")
          .attr("x", x(barValue) - 10)
          .attr("y", y("Your Metric") + y.bandwidth() / 2)
          .attr("dy", ".35em")
          .attr("text-anchor", "end")
          .text(`${(barValue * 100).toFixed(1)}%`)
          .style("fill", "#ffffff")
          .style("font-size", "14px")
          .style("font-weight", "bold");

        // Adjust label position if bar is too short
        if (x(barValue) < 40) {
          g.select("text")
            .attr("x", x(barValue) + 10)
            .attr("text-anchor", "start")
            .style("fill", "#1f2937"); // Tailwind's gray-800
        }
      });
    }
  };

  return (
    <Layout title="Dashboard — SecuFlow" description="Dashboard view">
      {/* Go Home Button */}
      <div className="p-4">
        <button
          onClick={() => navigate("/")}
          className="bg-gray-600 hover:bg-gray-800 transition-all text-white py-2 px-4 rounded-md"
        >
          Go Home
        </button>
      </div>

      {/* Main Content */}
      <div className="z-0 grid grid-cols-12 gap-4 min-h-[1000px]">
        {/* Search and Filters */}
        <aside className="col-span-12 xl:col-span-3 bg-gray-100 p-4">
          <h2 className="font-bold">Search / Filters</h2>
          <input
            type="text"
            placeholder="Filter by keyword"
            className="w-full mt-2 p-2 border border-gray-300 rounded"
          />
        </aside>

        {/* Visualizers Container */}
        <section className="col-span-12 xl:col-span-6 p-4 flex flex-col items-start h-full">
          {/* Status Message */}
          {status && <p className="mb-4 text-red-400">{status}</p>}

          {/* Visualizers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full flex-grow">
            <div className="bg-white shadow rounded-lg p-6 h-full">
              <h2 className="font-bold mb-4">Actual Graph</h2>
              <svg
                ref={d3ContainerRef1}
                className="text-center w-full h-full"
              ></svg>
            </div>
            <div className="bg-white shadow rounded-lg p-6 h-full">
              <h2 className="font-bold mb-4">Requirements Graph</h2>
              <svg
                ref={d3ContainerRef2}
                className="text-center w-full h-full"
              ></svg>
            </div>
          </div>

          {/* Bar Graph */}
          <div className="grid grid-cols-1 gap-4 w-full flex-grow">
            <div className="bg-white shadow-lg rounded-lg p-6 h-full">
              <h2 className="font-bold text-xl text-gray-700 mb-4">
                Bar Graph
              </h2>
              <div className="bg-gray-200 p-2 rounded mb-4 text-center font-medium text-gray-800">
                {barValue.toFixed(2)}
              </div>
              <div className="w-full h-64 relative">
                <svg
                  ref={d3ContainerRef3}
                  className="w-full h-full overflow-visible"
                ></svg>
              </div>
            </div>
          </div>
        </section>

        {/* Historical Data */}
        <div className="col-span-12 xl:col-span-3 bg-gray-100 p-4 mt-4 h-full">
          <h3 className="text-lg font-semibold mb-4">Historical Data</h3>
          <div className="bg-white shadow rounded-lg p-6 h-full">
            <div className="flex-grow">
              <div>[Graph goes here]</div>
              {/* You can use libraries like Chart.js or D3.js to render graphs */}
            </div>
          </div>
        </div>

        {/* Metrics & Interactions */}
        <aside className="col-span-12 xl:col-span-3 bg-gray-100 p-4 space-y-6">
          <h2 className="font-bold">Security Analyst's Metrics</h2>
          {/* Placeholder for metrics like graphs */}
          <div className="bg-white shadow rounded-lg p-6">
            <div>[Metric 1]</div>
            <div>[Metric 2]</div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="font-semibold">User Info (click for updates)</h3>
            <p>[User details]</p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="font-semibold">Key Interactions</h3>
            <ul>
              <li>Interaction 1</li>
              <li>Interaction 2</li>
            </ul>
          </div>
        </aside>
      </div>

      <div className="max-w-[105rem] mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold mb-4">Task Timelines / Logs</h3>
          <ul>
            <li>Task 1: Completed</li>
            <li>Task 2: Pending</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
