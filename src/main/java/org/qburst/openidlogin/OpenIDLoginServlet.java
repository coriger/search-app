package org.qburst.openidlogin;

import java.io.IOException;
import java.io.InputStream;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.HashSet;
import java.util.Properties;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.qburst.openid.Association;
import org.qburst.openid.Endpoint;
import org.qburst.openid.OpenIdException;
import org.qburst.openid.OpenIdManager;
import org.qburst.search.model.Authentication;

public class OpenIDLoginServlet extends HttpServlet {
	private static final long serialVersionUID = 6077626908073845446L;
	
	static final long ONE_HOUR = 3600000L;
	static final long TWO_HOUR = ONE_HOUR * 2L;
	static final String ATTR_MAC = "openid_mac";
	static final String ATTR_ALIAS = "openid_alias";

	private OpenIdManager manager;
	Properties props = new Properties();

	@Override
	public void init() throws ServletException {
		super.init();
		InputStream input = null;
		try {
			input = getClass().getClassLoader().getResourceAsStream("openid-urls.properties");
			props.load(input);
		} catch (IOException e) {
			// load failed:
			e.printStackTrace();
		} finally {
			if (input != null) {
				try {
					input.close();
				} catch (IOException e) {
				}
			}
		}

		manager = new OpenIdManager();
		manager.setRealm(props.getProperty("realm"));
		manager.setReturnTo(props.getProperty("returnToURL"));
	}

	@Override
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		String op = request.getParameter("op");
		if (op == null) {

			if (request.getAttribute("noAuthentication") == null) {
				// check sign on result from Google or Yahoo:
				checkNonce(request.getParameter("openid.response_nonce"));
				// get authentication:
				byte[] mac_key = (byte[]) request.getSession().getAttribute(
						ATTR_MAC);
				String alias = (String) request.getSession().getAttribute(
						ATTR_ALIAS);
				Authentication authentication = manager.getAuthentication(
						request, mac_key, alias);
				request.getSession(true).setAttribute(
						LoginFilter.OPENID_INDENTITY, authentication);
			}
			request.getRequestDispatcher(props.getProperty("searchAppURL"))
					.forward(request, response);
			return;
		} else if (op.equals("Google") || op.equals("Yahoo")
				|| op.equals("GoogleApp")) {
			// redirect to Google or Yahoo sign on page:
			Endpoint endpoint = manager.lookupEndpoint(op);
			Association association = manager.lookupAssociation(endpoint);
			request.getSession().setAttribute(ATTR_MAC,
					association.getRawMacKey());
			request.getSession().setAttribute(ATTR_ALIAS, endpoint.getAlias());
			String url = manager.getAuthenticationUrl(endpoint, association);
			response.sendRedirect(url);
		} else {
			throw new ServletException("Unsupported OP: " + op);
		}
	}

	void checkNonce(String nonce) {
		// check response_nonce to prevent replay-attack:
		if (nonce == null || nonce.length() < 20)
			throw new OpenIdException("Verify failed.");
		// make sure the time of server is correct:
		long nonceTime = getNonceTime(nonce);
		long diff = Math.abs(System.currentTimeMillis() - nonceTime);
		if (diff > ONE_HOUR)
			throw new OpenIdException("Bad nonce time.");
		if (isNonceExist(nonce))
			throw new OpenIdException("Verify nonce failed.");
		storeNonce(nonce, nonceTime + TWO_HOUR);
	}

	// simulate a database that store all nonce:
	private Set<String> nonceDb = new HashSet<String>();

	// check if nonce is exist in database:
	boolean isNonceExist(String nonce) {
		return nonceDb.contains(nonce);
	}

	// store nonce in database:
	void storeNonce(String nonce, long expires) {
		nonceDb.add(nonce);
	}

	long getNonceTime(String nonce) {
		try {
			return new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ").parse(
					nonce.substring(0, 19) + "+0000").getTime();
		} catch (ParseException e) {
			throw new OpenIdException("Bad nonce time.");
		}
	}

}
