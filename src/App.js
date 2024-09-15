import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <table className="attacks-data">
          <thead>
            <tr>
              <th className="name">Name</th>
              <th className="desc">Description</th>
              <th className="detection">Detection</th>
              <th className="platforms">Platforms</th>
              <th className="phase">Phase</th>
              <th className="id">Unique ID</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Extra Window Memory Injection</td>
              <td>{shortenDescription("Adversaries may inject malicious code into process via Extra Window Memory (EWM) in order to evade process-based defenses as well as possibly elevate privileges. EWM injection is a method of executing arbitrary code in the address space of a separate live process. \n\nBefore creating a window, graphical Windows-based processes must prescribe to or register a windows class, which stipulate appearance and behavior (via windows procedures, which are functions that handle input/output of data).(Citation: Microsoft Window Classes) Registration of new windows classes can include a request for up to 40 bytes of EWM to be appended to the allocated memory of each instance of that class. This EWM is intended to store data specific to that window and has specific application programming interface (API) functions to set and get its value. (Citation: Microsoft GetWindowLong function) (Citation: Microsoft SetWindowLong function)\n\nAlthough small, the EWM is large enough to store a 32-bit pointer and is often used to point to a windows procedure. Malware may possibly utilize this memory location in part of an attack chain that includes writing code to shared sections of the process\u2019s memory, placing a pointer to the code in EWM, then invoking execution by returning execution control to the address in the process\u2019s EWM.\n\nExecution granted through EWM injection may allow access to both the target process's memory and possibly elevated privileges. Writing payloads to shared sections also avoids the use of highly monitored API calls such as <code>WriteProcessMemory</code> and <code>CreateRemoteThread</code>.(Citation: Elastic Process Injection July 2017) More sophisticated malware samples may also potentially bypass protection mechanisms such as data execution prevention (DEP) by triggering a combination of windows procedures and other system functions that will rewrite the malicious payload inside an executable portion of the target process.  (Citation: MalwareTech Power Loader Aug 2013) (Citation: WeLiveSecurity Gapz and Redyms Mar 2013)\n\nRunning code in the context of another process may allow access to the process's memory, system/network resources, and possibly elevated privileges. Execution via EWM injection may also evade detection from security products since the execution is masked under a legitimate process. ")}</td>
              <td>{shortenDescription("Monitor for API calls related to enumerating and manipulating EWM such as GetWindowLong (Citation: Microsoft GetWindowLong function) and SetWindowLong (Citation: Microsoft SetWindowLong function). Malware associated with this technique have also used SendNotifyMessage (Citation: Microsoft SendNotifyMessage function) to trigger the associated window procedure and eventual malicious injection. (Citation: Elastic Process Injection July 2017)")}</td>
              <td>Windows</td>
              <td>defense-evasion</td>
              {/* <td>attack-pattern--0042a9f5-f053-4769-b3ef-9ad018dfa298</td> */}
              <td>attack-pattern--0042a9f5-f053-4769-b3ef-9ad018dfa298</td>
            </tr>
            <tr>
              <td>lorem</td>
              <td>lorem lorem ipsum</td>
              <td>ipsum</td>
              <td>ipsum</td>
              <td>lorem</td>
              <td>ipsum</td>
            </tr>
            <tr>
              <td>lorem</td>
              <td>lorem lorem ipsum</td>
              <td>ipsum</td>
              <td>ipsum</td>
              <td>lorem</td>
              <td>ipsum</td>
            </tr>
            <tr>
              <td>lorem</td>
              <td>lorem lorem ipsum</td>
              <td>ipsum</td>
              <td>ipsum</td>
              <td>lorem</td>
              <td>ipsum</td>
            </tr>
          </tbody>
        </table>
      </header>
    </div>
  );
}

function shortenDescription(desc) {
  // Try to find a sentence at least 30 chars long
  const position = desc.indexOf('.');

  if (position >= 29) // Starting at index 0
    return desc.slice(0, position) + "..."; // Return only 1st sentence
  
  return desc.slice(0, 30) + "...";
}

export default App;
