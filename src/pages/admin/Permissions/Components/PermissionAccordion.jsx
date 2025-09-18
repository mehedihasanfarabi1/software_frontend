import React, { useRef } from "react";

export default function PermissionAccordion({ grouped, selected, setSelected }) {
  const toggleOne = (code) => {
    setSelected((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const toggleSubModule = (perms, checked) => {
    const codes = perms.map((p) => p.code);
    setSelected((prev) =>
      checked ? Array.from(new Set([...prev, ...codes])) : prev.filter((c) => !codes.includes(c))
    );
  };

  const toggleMainGroup = (main, checked) => {
    const codes = Object.values(grouped[main] || {}).flat().map((p) => p.code);
    setSelected((prev) =>
      checked ? Array.from(new Set([...prev, ...codes])) : prev.filter((c) => !codes.includes(c))
    );
  };

  return (
    <div className="accordion" id="mainAccordion">
      {Object.keys(grouped).map((main, i) => {
        const allCodes = Object.values(grouped[main]).flat().map((p) => p.code);
        const allSelected = allCodes.every((c) => selected.includes(c));
        const partialSelected = allCodes.some((c) => selected.includes(c)) && !allSelected;

        return (
          <div className="accordion-item mb-3 shadow-sm" key={main}>
            <h2 className="accordion-header" id={`main-${i}`}>
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapse-main-${i}`}
              >
                <div className="form-check m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => el && (el.indeterminate = partialSelected)}
                    onChange={(e) => toggleMainGroup(main, e.target.checked)}
                  />
                  <label className="form-check-label fw-bold ms-2">{main.toUpperCase()}</label>
                </div>
              </button>
            </h2>
            <div id={`collapse-main-${i}`} className="accordion-collapse collapse">
              <div className="accordion-body">
                {Object.entries(grouped[main]).map(([module, perms], j) => {
                  const allSubSelected = perms.every((p) => selected.includes(p.code));
                  const partialSub = perms.some((p) => selected.includes(p.code)) && !allSubSelected;
                  return (
                    <div className="accordion-item mb-3 border rounded shadow-sm" key={`${main}-${module}`}>
                      <h2 className="accordion-header" id={`sub-${i}-${j}`}>
                        <button
                          className="accordion-button collapsed small"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#collapse-sub-${i}-${j}`}
                        >
                          <div className="form-check m-0">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={allSubSelected}
                              ref={(el) => el && (el.indeterminate = partialSub)}
                              onChange={(e) => toggleSubModule(perms, e.target.checked)}
                            />
                            <label className="form-check-label ms-2">
                              {module.replaceAll("_", " ").toUpperCase()}
                            </label>
                          </div>
                        </button>
                      </h2>
                      <div id={`collapse-sub-${i}-${j}`} className="accordion-collapse collapse">
                        <div className="accordion-body">
                          <div className="row">
                            {perms.map((p) => (
                              <div className="col-md-3 mb-2" key={p.code}>
                                <div className="form-check border rounded p-3 shadow-sm bg-light">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={selected.includes(p.code)}
                                    onChange={() => toggleOne(p.code)}
                                  />
                                  <label className="form-check-label ms-2 fw-semibold">
                                    {p.action.toUpperCase()}
                                  </label>
                                  <div className="small text-muted ms-4">{p.code}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
